"use client";
import { useState, useEffect } from "react";

type Thought = {
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
}

// A page.tsx file is just a React component similar to DailyThought.tsx
// The difference is it is stored within a directory and the path to that directory will load the component
// In this case, the path is /thoughts
export default function Thoughts() {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [deletedThoughts,deleteThoughts] = useState<Thought[]>([]);
    const [editedThoughts,editThoughts] = useState<Thought[]>([]);


    //const [thoughts, deleteThoughts] = useState<Thought[]>([]);

    
    // Load thoughts from the database using our GET route
    useEffect(() => {
        async function loadThoughts() {
            const res = await fetch("/api/entry");
            
            if (!res.ok) return;
            const data: EntryFromDB[] = await res.json();
            
            // Transform the response into a Thought
            const formatted: Thought[] = data.map((row) => (
                {
                    text: row.text,
                    time: new Date(row.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    competencies: row.competencies,
                }
            ));
            setThoughts(formatted);

           // deleteThoughts(formatted);


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

    return (
        <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md mt-5">
            <h2 className="text-2xl font-bold mb-4 text-[#ff0000]">All My Thoughts</h2>
            <div className="space-y-4">
                    {thoughts.length === 0 ? (<p className="italic text-center">No thoughts yet. Start typing!</p>) : (
                        thoughts.map((thought, index) => (
                            <div 
                                key={index}
                                className="bg-white/20 p-3 rounded-lg shadow-sm">
                                <p className="text-lg">{thought.text}</p>
                                <p className="text-sm opacity-80 mt-1">{thought.time}</p>

                                <button
                                        onClick={() => deleteThoughts(thoughts)}
                                                        className="bg-white text-[#ff0000] px-3 py-1 rounded-md font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>


                                 <button
                                        onClick={() => editThoughts(thoughts)}
                                                        className="bg-white text-[#ff0000] px-3 py-1 rounded-md font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>

                                {thought.competencies.length > 0 && (
                                <p className="text-sm mt-1">
                                    <strong>Competencies: </strong>
                                    {thought.competencies.map((id) =>
                                        competencies.find((c) => c.id === id)?.skill || `#${id}`).join(", ")
            
                                    }
                                </p>
                            )}      
                            </div>
                        ))
                    )}
                </div>
        </div>
    );
}