import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiClock, FiTag, FiDollarSign, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// --- Individual Appointment Card Component ---
const AppointmentCard = ({ appointment, onStatusChange }) => {
    const [isNotesExpanded, setIsNotesExpanded] = useState(false);

    const getStatusStyles = (status) => {
        switch (status) {
            case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "Confirmed": return "bg-blue-100 text-blue-800 border-blue-300";
            case "Completed": return "bg-green-100 text-green-800 border-green-300";
            case "Cancelled": return "bg-red-100 text-red-800 border-red-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* --- Card Header --- */}
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{appointment.name}</h3>
                    <p className="text-sm text-gray-500">{appointment.email}</p>
                </div>
                <select
                    value={appointment.status}
                    onChange={(e) => onStatusChange(appointment._id, e.target.value)}
                    className={`text-sm font-semibold rounded-full px-3 py-1 border focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusStyles(appointment.status)}`}
                >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* --- Card Body --- */}
            <div className="p-4 space-y-4">
                {/* Date & Time */}
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                        <FiCalendar className="text-gray-400" />
                        <strong>Date:</strong>
                        <span>{new Date(appointment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <FiClock className="text-gray-400" />
                        <strong>Time:</strong>
                        <span>{appointment.time}</span>
                    </div>
                </div>

                {/* Preferences */}
                <div>
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Preferences</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"><FiTag className="text-gray-500" /> {appointment.material || "N/A"}</span>
                        <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"><FiDollarSign className="text-gray-500" /> {appointment.budget || "N/A"}</span>
                        <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"><FiEdit className="text-gray-500" /> {appointment.shape || "N/A"}</span>
                    </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                    <div>
                        <button onClick={() => setIsNotesExpanded(!isNotesExpanded)} className="text-xs font-bold uppercase text-gray-400 hover:text-gray-600">
                            {isNotesExpanded ? 'Hide Notes' : 'Show Notes'}
                        </button>
                        {isNotesExpanded && (
                            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">
                                {appointment.notes}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main Page Component ---
export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await axios.get(`${backdendUrl}/api/appointments/get-appointments`);
                setAppointments(res.data.data);
            } catch (err) {
                console.error("❌ Error fetching appointments:", err.message);
                toast.error("Failed to load appointments.");
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        const originalAppointments = [...appointments];

        // Optimistically update the UI
        const updatedAppointments = appointments.map((apt) =>
            apt._id === orderId ? { ...apt, status: newStatus } : apt
        );
        setAppointments(updatedAppointments);

        try {
            // API call to update the status in the backend
            // await axios.put(`${backdendUrl}/api/appointments/${orderId}/status`, { status: newStatus });
            toast.success(`Appointment status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Could not update status. Reverting changes.");
            // Revert UI on failure
            setAppointments(originalAppointments);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">⏳ Loading appointments...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">📅 Virtual Appointments</h1>
                {appointments.length === 0 ? (
                    <div className="text-center bg-white p-12 rounded-lg shadow-md">
                        <p className="text-gray-500">No appointments found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments.map((apt) => (
                            <AppointmentCard key={apt._id} appointment={apt} onStatusChange={handleStatusChange} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
