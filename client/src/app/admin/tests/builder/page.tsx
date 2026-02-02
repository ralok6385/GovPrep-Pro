"use client";

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Save, GripVertical, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import BackButton from '@/components/BackButton';

// --- Types ---
interface QuestionDraft {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctOption: string;
    type: 'multiple-choice' | 'true-false';
}

// --- Sortable Item Component ---
function SortableQuestion({ question, onDelete, onUpdate }: { question: QuestionDraft, onDelete: (id: string) => void, onUpdate: (id: string, field: string, value: any) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3 flex gap-4 group hover:border-indigo-500/50 transition-colors">
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab text-slate-600 hover:text-indigo-400 self-center">
                <GripVertical className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
                <input
                    type="text"
                    value={question.text}
                    onChange={(e) => onUpdate(question.id, 'text', e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-3">
                    {question.options.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer ${question.correctOption === opt.id ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}
                                onClick={() => onUpdate(question.id, 'correctOption', opt.id)}
                            >
                                <span className="text-xs font-bold text-white">{String.fromCharCode(65 + idx)}</span>
                            </div>
                            <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[idx].text = e.target.value;
                                    onUpdate(question.id, 'options', newOptions);
                                }}
                                className={`flex-1 bg-slate-950 border rounded-lg p-2 text-sm text-slate-300 focus:outline-none ${question.correctOption === opt.id ? 'border-emerald-500/50' : 'border-slate-800'}`}
                                placeholder={`Option ${idx + 1}`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <button onClick={() => onDelete(question.id)} className="self-start text-slate-600 hover:text-red-400 p-2">
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
}

export default function TestBuilder() {
    const [questions, setQuestions] = useState<QuestionDraft[]>([]);
    const [title, setTitle] = useState("Untitled Test");
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState("");

    // Fetch exams on mount
    useState(() => {
        import('@/lib/api').then(m => {
            m.default.get('/exams').then(res => {
                setExams(res.data);
                if (res.data.length > 0) setSelectedExamId(res.data[0]._id);
            });
        });
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addQuestion = () => {
        const newQ: QuestionDraft = {
            id: uuidv4(),
            text: "",
            options: [
                { id: "opt1", text: "" },
                { id: "opt2", text: "" },
                { id: "opt3", text: "" },
                { id: "opt4", text: "" }
            ],
            correctOption: "opt1",
            type: 'multiple-choice'
        };
        setQuestions([...questions, newQ]);
    };

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleSave = async () => {
        try {
            const { data } = await import('@/lib/api').then(m => m.default.post('/tests', {
                title,
                questions, // Backend now handles objects
                type: 'exam',
                durationMinutes: 60, // Default
                totalMarks: questions.length * 2,
                positiveMark: 2,
                negativeMark: 0.5,
                examId: selectedExamId,
                description: 'Created with Drag & Drop Builder'
            }));
            alert('Test Created Successfully! ID: ' + data._id);
            window.location.href = '/admin/tests';
        } catch (err) {
            console.error(err);
            alert('Failed to create test');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <BackButton label="Back to Admin" />
                    <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                        <Save className="w-5 h-5" /> Save Test
                    </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
                    <div className="flex gap-4 mb-2">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-3xl font-bold bg-transparent border-none focus:outline-none flex-1 placeholder-slate-600"
                            placeholder="Test Title"
                        />
                        <select
                            value={selectedExamId}
                            onChange={(e) => setSelectedExamId(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        >
                            <option value="" disabled>Select Exam Category</option>
                            {exams.map(e => (
                                <option key={e._id} value={e._id}>{e.title}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-slate-500">Drag and drop to reorder. Click the circle to mark correct answer.</p>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                        {questions.map((q) => (
                            <SortableQuestion
                                key={q.id}
                                question={q}
                                onDelete={deleteQuestion}
                                onUpdate={updateQuestion}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 font-bold">
                    <Plus className="w-6 h-6" /> Add Question
                </button>
            </div>
        </div>
    );
}
