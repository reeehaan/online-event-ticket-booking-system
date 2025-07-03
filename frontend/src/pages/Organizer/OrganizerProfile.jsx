import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function OrganizerProfile() {
const [organizer, setOrganizer] = useState({
firstName: "",
lastName: "",
organizationName: "",
organizationType: "",
description: "",
address: "",
city: "",
});

const [originalData, setOriginalData] = useState(null);
const [loading, setLoading] = useState(true);
const [isEditing, setIsEditing] = useState(false);

const fetchOrganizerProfile = async () => {
setLoading(true);
try {
    const dummy = {
    firstName: "Rehan",
    lastName: "Hansaja",
    organizationName: "IslandEvents",
    organizationType: "Event Management",
    description: "We organize world-class events around Sri Lanka.",
    address: "123 Beach Road",
    city: "Colombo",
    };
    await new Promise((res) => setTimeout(res, 1000));
    setOrganizer(dummy);
    setOriginalData(dummy);
} catch (error) {
    toast.error("Failed to load profile");
} finally {
    setLoading(false);
}
};

useEffect(() => {
fetchOrganizerProfile();
}, []);

const handleChange = (e) => {
const { name, value } = e.target;
setOrganizer((prev) => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
e.preventDefault();
try {
    // Replace with your actual API
    await new Promise((res) => setTimeout(res, 1000));
    toast.success("Profile updated successfully!");
    setOriginalData(organizer);
    setIsEditing(false);
} catch {
    toast.error("Failed to update profile");
}
};

const handleCancel = () => {
setOrganizer(originalData);
setIsEditing(false);
};

if (loading) {
return (
    <div className="text-center mt-10 text-gray-500 text-lg">
    Loading profile...
    </div>
);
}

return (
<div className="max-w-4xl mx-auto mt-12 p-4">
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border">
    {/* Banner */}
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-36"></div>

    {/* Avatar */}
    <div className="-mt-14 px-6">
        <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-4xl text-white font-bold shadow-lg">
        {organizer.firstName[0]}
        </div>
    </div>

    <div className="px-6 pb-6 pt-4">
        {!isEditing ? (
        <>
            <div className="text-2xl font-bold text-gray-800 mb-1">
            {organizer.firstName} {organizer.lastName}
            </div>
            <div className="text-gray-500 text-sm mb-6">
            {organizer.organizationType}
            </div>

            <div className="space-y-3 text-gray-700 text-sm">
            <div>
                <strong>Organization Name:</strong>{" "}
                {organizer.organizationName}
            </div>
            <div>
                <strong>Description:</strong>{" "}
                {organizer.description || "-"}
            </div>
            <div>
                <strong>Address:</strong> {organizer.address || "-"}
            </div>
            <div>
                <strong>City:</strong> {organizer.city || "-"}
            </div>
            </div>

            <div className="text-right mt-6">
            <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Edit Profile
            </button>
            </div>
        </>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium">First Name</label>
                <input
                type="text"
                name="firstName"
                value={organizer.firstName}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
                />
            </div>
            <div>
                <label className="text-sm font-medium">Last Name</label>
                <input
                type="text"
                name="lastName"
                value={organizer.lastName}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
                />
            </div>
            </div>

            <div>
            <label className="text-sm font-medium">
                Organization Name
            </label>
            <input
                type="text"
                name="organizationName"
                value={organizer.organizationName}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
            />
            </div>

            <div>
            <label className="text-sm font-medium">
                Organization Type
            </label>
            <input
                type="text"
                name="organizationType"
                value={organizer.organizationType}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
            />
            </div>

            <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
                name="description"
                value={organizer.description}
                onChange={handleChange}
                rows={3}
                className="w-full border px-3 py-2 rounded-lg"
            />
            </div>

            <div>
            <label className="text-sm font-medium">Address</label>
            <input
                type="text"
                name="address"
                value={organizer.address}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
            />
            </div>

            <div>
            <label className="text-sm font-medium">City</label>
            <input
                type="text"
                name="city"
                value={organizer.city}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
            />
            </div>

            <div className="flex justify-end gap-3 pt-4">
            <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
                Save
            </button>
            <button
                type="button"
                onClick={handleCancel}
                className="border border-gray-400 px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
                Cancel
            </button>
            </div>
        </form>
        )}
    </div>
    </div>

    <ToastContainer position="bottom-center" autoClose={3000} />
</div>
);
}

export default OrganizerProfile;
