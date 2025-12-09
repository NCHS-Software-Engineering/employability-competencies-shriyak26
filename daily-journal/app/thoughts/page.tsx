"use client";
import { useState, useEffect } from "react";

type Thought = {
    id: number;
    text: string;
    time: string;
    competencies: number[];
};

type Competency = {
    id: number;
    skill: string;
    description: string;
};

type EntryFromDB = {
    id: number;
    text: string;
    createdAt: string;
    competencies: number[];
};

export default function Thoughts() {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [editing, setEditing] = useState<Thought | null>(null); // Track the thought being edited
    const [newText, setNewText] = useState(""); // New text for the edited thought
    const [newCompetencies, setNewCompetencies] = useState<number[]>([]); // New selected competencies for the edited thought

    // Load thoughts from the database using our GET route
    useEffect(() => {
        async function loadThoughts() {
            const res = await fetch("/api/entry");

            if (!res.ok) return;
            const data: EntryFromDB[] = await res.json();

            const formatted: Thought[] = data.map((row) => ({
                id: row.id,
                text: row.text,
                time: new Date(row.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                competencies: row.competencies,
            }));
            setThoughts(formatted);
        }
        loadThoughts();
    }, []);

    useEffect(() => {
        async function fetchCompetencies() {
            const res = await fetch("/api/competencies");
            const data = await res.json();
            setCompetencies(data);
        }
        fetchCompetencies();
    }, []);

    // Function to delete a thought
    const handleDelete = async (id: number) => {
        const res = await fetch(`/api/entry/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            alert("Failed to delete thought.");
            return;
        }

        // Remove the deleted thought from the state
        setThoughts(thoughts.filter((thought) => thought.id !== id));
    };

    // Function to handle the edit button click
    const handleEdit = (thought: Thought) => {
        setEditing(thought);
        setNewText(thought.text); // Prefill the form with the current thought's text
        setNewCompetencies(thought.competencies); // Prefill the competencies
    };

    // Function to handle the save (update) button click
    const handleSaveEdit = async () => {
        if (!editing) return;

        const res = await fetch(`/api/entry/${editing.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: newText,
                competencyIDs: newCompetencies,
            }),
        });

        if (!res.ok) {
            alert("Failed to update the thought.");
            return;
        }

        // Update the thought in the state after successful edit
        setThoughts(
            thoughts.map((thought) =>
                thought.id === editing.id
                    ? { ...thought, text: newText, competencies: newCompetencies }
                    : thought
            )
        );

        // Reset the editing state
        setEditing(null);
        setNewText("");
        setNewCompetencies([]);
    };

    // Function to handle competency checkbox change during edit
    const handleCompetencyChange = (competencyId: number) => {
        setNewCompetencies((prevCompetencies) =>
            prevCompetencies.includes(competencyId)
                ? prevCompetencies.filter((id) => id !== competencyId)
                : [...prevCompetencies, competencyId]
        );
    };

    return (
        <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md mt-5">
            <h2 className="text-2xl font-bold mb-4 text-[#ff0000]">All My Thoughts</h2>

            {/* Render the edit form if we're editing a thought */}
            {editing && (
                <div className="mb-5 p-4 bg-white/20 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-3">Edit Thought</h3>
                    <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        className="w-full p-2 mb-3 border rounded-md"
                        rows={4}
                    />
                    <div className="space-y-1 mb-3">
                        <h4 className="font-semibold">Select Competencies:</h4>
                        {competencies.map((competency) => (
                            <label
                                key={competency.id}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={newCompetencies.includes(competency.id)}
                                    onChange={() => handleCompetencyChange(competency.id)}
                                    className="cursor-pointer"
                                />
                                <span>{competency.skill}</span>
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={handleSaveEdit}
                        className="bg-[#ff0000] text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={() => setEditing(null)}
                        className="ml-2 bg-gray-300 text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Render all thoughts */}
            <div className="space-y-4">
                {thoughts.length === 0 ? (
                    <p className="italic text-center">No thoughts yet. Start typing!</p>
                ) : (
                    thoughts.map((thought) => (
                        <div key={thought.id} className="bg-white/20 p-3 rounded-lg shadow-sm">
                            <p className="text-lg">{thought.text}</p>
                            <p className="text-sm opacity-80 mt-1">{thought.time}</p>

                            {/* Edit and Delete buttons */}
                            <div className="mt-3 flex gap-3">
                                <button
                                    onClick={() => handleEdit(thought)} // Start editing the thought
                                    className="bg-blue-500 text-white px-3 py-1 rounded-md font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(thought.id)} // Call the delete handler
                                    className="bg-white text-[#ff0000] px-3 py-1 rounded-md font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>

                            {thought.competencies.length > 0 && (
                                <p className="text-sm mt-1">
                                    <strong>Competencies: </strong>
                                    {thought.competencies
                                        .map(
                                            (id) =>
                                                competencies.find((c) => c.id === id)?.skill ||
                                                `#${id}`
                                        )
                                        .join(", ")}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
