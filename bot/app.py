from flask import Flask, request, jsonify, render_template
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_google_genai import ChatGoogleGenerativeAI
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BASE_URL = "http://localhost:8080/api"

app = Flask(__name__, template_folder='.')

# Initialize memory
memory = ConversationBufferMemory()

# Initialize Gemini model with LangChain
llm = ChatGoogleGenerativeAI(model="gemini-pro", api_key=GEMINI_API_KEY)
conversation = ConversationChain(llm=llm, memory=memory)

# Global state for booking data
booking_state = {"patient_id": 15, "doctor_id": None, "date": None, "time": None, "reason": None}

def get_doctor_data(specialization=None):
    url = f"{BASE_URL}/doctors" + (f"?specialization={specialization}" if specialization else "")
    response = requests.get(url)
    return response.json() if response.status_code == 200 else []

def get_doctor_reviews(doctor_id):
    response = requests.get(f"{BASE_URL}/reviews/doctor/{doctor_id}")
    if response.status_code == 200:
        reviews = response.json()
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
        feedback = ", ".join(r["comment"] for r in reviews[:3]) if reviews else "No feedback"
        return avg_rating, feedback
    return 0, "No feedback"

def get_available_slots(doctor_id):
    response = requests.get(f"{BASE_URL}/appointments/doctor/{doctor_id}")
    if response.status_code == 200:
        appointments = response.json()
        # Mock availability (replace with real logic later)
        available = ["2025-08-20 10:00:00", "2025-08-21 14:00:00"]
        return available
    return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "").lower()
    response = {"message": ""}

    # Get conversation history from memory
    history = memory.buffer

    if "hello" in user_input or "hi" in user_input:
        response["message"] = "Hello! I’m your healthcare assistant. Tell me about your health issue or ask how I can help."
    
    elif any(problem in user_input for problem in ["chest pain", "fever"]):
        problem = next(p for p in ["chest pain", "fever"] if p in user_input)
        specialization = "Cardiology" if problem == "chest pain" else "General Medicine"
        doctors = get_doctor_data(specialization)
        if doctors:
            doctor_options = [f"Dr. {d['name']} (id: {d['id']}, {d['specialization']}, {get_doctor_reviews(d['id'])[0]:.1f}/5)" for d in doctors]
            response["message"] = f"Based on your issue, I suggest a {specialization} specialist. Options: {', '.join(doctor_options)}. Want details on any doctor or to book?"
        else:
            response["message"] = "No doctors available for that issue. Please try again later."
    
    elif "details" in user_input and "dr." in user_input:
        for doctor in get_doctor_data():
            if f"dr. {doctor['name'].lower()}" in user_input:
                doctor_id = doctor["id"]
                avg_rating, feedback = get_doctor_reviews(doctor_id)
                response["message"] = f"Dr. {doctor['name']} specializes in {doctor['specialization']}, rated {avg_rating:.1f}/5. Feedback: {feedback}. Book an appointment?"
                booking_state["doctor_id"] = doctor_id
                break
        else:
            response["message"] = "Doctor not found. Please specify a valid doctor."
    
    elif "book" in user_input and booking_state["doctor_id"]:
        available_slots = get_available_slots(booking_state["doctor_id"])
        if available_slots:
            response["message"] = f"Great! Available slots for the selected doctor: {', '.join(available_slots)}. Please provide a date and time (e.g., '2025-08-20 10:00:00')."
        else:
            response["message"] = "No available slots. Please try another doctor or time."
    
    elif booking_state["doctor_id"] and not booking_state["date"]:
        try:
            booking_state["date"], booking_state["time"] = user_input.strip().split()
            response["message"] = "Got the date and time. Please provide a reason for the visit (e.g., 'check-up')."
        except ValueError:
            response["message"] = "Please provide date and time in format 'YYYY-MM-DD HH:MM:SS'."
    
    elif booking_state["doctor_id"] and booking_state["date"] and not booking_state["reason"]:
        booking_state["reason"] = user_input.strip()
        appointment_data = {
            "patientId": booking_state["patient_id"],
            "doctorId": booking_state["doctor_id"],
            "appointmentDate": booking_state["date"],
            "appointmentTime": booking_state["time"],
            "reason": booking_state["reason"]
        }
        response = requests.post(f"{BASE_URL}/appointments", json=appointment_data)
        if response.status_code == 201:
            appointment = response.json()
            response["message"] = f"Appointment booked with ID #{appointment['id']} for {booking_state['date']} {booking_state['time']} with the selected doctor. Confirmation coming soon! Anything else?"
            booking_state = {"patient_id": 15, "doctor_id": None, "date": None, "time": None, "reason": None}  # Reset state
        else:
            response["message"] = f"Booking failed: {response.json().get('message', 'Try again later.')}"
    
    else:
        # Let Gemini handle the response with memory
        prompt = f"Based on our conversation: {history}, respond to: {user_input}"
        gemini_response = conversation.predict(input=prompt)
        response["message"] = gemini_response

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True, port=5000)