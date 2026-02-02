"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function BulkUploadPage() {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [tests, setTests] = useState<any[]>([]);
    const [selectedTestId, setSelectedTestId] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const { data } = await api.get('/tests');
                setTests(data);
                // toast.success(`Found ${data.length} active tests`);
            } catch (error) {
                console.error('Failed to fetch tests', error);
                toast.error('Could not load tests list');
            }
        };
        fetchTests();
    }, []);

    // Helper to categorize tests safely
    const getTestType = (t: any) => (t.type || 'exam').toLowerCase();
    const exams = tests.filter(t => getTestType(t) === 'exam');
    const quizzes = tests.filter(t => getTestType(t) === 'quiz');
    const others = tests.filter(t => {
        const type = getTestType(t);
        return type !== 'exam' && type !== 'quiz';
    });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                text: "What is the capital of India?",
                textHindi: "भारत की राजधानी क्या है?",
                optionA: "Mumbai",
                optionAHindi: "मुंबई",
                optionB: "Delhi",
                optionBHindi: "दिल्ली",
                optionC: "Kolkata",
                optionCHindi: "कोलकाता",
                optionD: "Chennai",
                optionDHindi: "चेन्नई",
                correctOption: "Delhi",
                explanation: "New Delhi is the capital of India.",
                explanationHindi: "नई दिल्ली भारत की राजधानी है।",
                subjectId: "Enter Subject ID (Optional)",
                difficulty: "easy"
            },
            {
                text: "Speed = Distance / ?",
                textHindi: "गति = दूरी / ?",
                optionA: "Time",
                optionAHindi: "समय",
                optionB: "Mass",
                optionBHindi: "द्रव्यमान",
                optionC: "Force",
                optionCHindi: "बल",
                optionD: "acceleration",
                optionDHindi: "त्वरण",
                correctOption: "Time",
                explanation: "Speed formula.",
                explanationHindi: "गति का सूत्र।",
                subjectId: "",
                difficulty: "medium"
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Question_Bank_Template.xlsx");
    };


    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            // Check for PDF
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                const formData = new FormData();
                formData.append('file', file);
                if (selectedTestId) {
                    formData.append('testId', selectedTestId);
                }

                // You might want to grab subjectId from a state if you add a subject selector later
                // formData.append('subjectId', selectedSubjectId);

                const { data } = await api.post('/upload/pdf-questions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                toast.success(data.message);
                setFile(null);
                setTimeout(() => router.push('/admin/questions'), 1500);

            } else {
                // EXCEL / CSV Logic - NOW ON BACKEND
                const formData = new FormData();
                formData.append('file', file);
                if (selectedTestId) {
                    formData.append('testId', selectedTestId);
                }

                // formData.append('subjectId', selectedSubjectId); // Add if you have subject selector

                const { data } = await api.post('/upload/excel-questions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 300000 // 5 minutes for complex AI processing
                });

                toast.success(data.message);
                setFile(null);
                setTimeout(() => router.push('/admin/questions'), 1500);
            }
        } catch (error: any) {
            console.error("Upload Error:", error);
            const serverMsg = error.response?.data?.message || error.response?.data?.error;
            toast.error(serverMsg || 'Upload failed');
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-screen bg-slate-950 text-white flex flex-col">
            <Link href="/admin/tests" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 mb-6 transition-colors w-fit font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Test Creator
            </Link>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="bg-slate-800 p-5 rounded-3xl mb-6 shadow-xl shadow-black/20 border border-slate-700 relative z-10">
                    <UploadCloud className="w-12 h-12 text-indigo-400" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Bulk Question Upload</h1>
                <p className="text-slate-400 max-w-md mb-8 leading-relaxed relative z-10">
                    Import questions from Excel/PDF into a specific Test or Quiz.
                </p>

                {/* Test Selection - Always Visible */}
                <div className="w-full max-w-xl mb-8 relative z-10 text-left">
                    <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Select Target Test / Quiz</label>
                    <div className="relative">
                        <select
                            value={selectedTestId}
                            onChange={(e) => setSelectedTestId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none font-medium"
                        >
                            <option value="">-- Just Add to Question Bank (No Test) --</option>

                            {exams.length > 0 && (
                                <optgroup label="Full Exams">
                                    {exams.map(test => (
                                        <option key={test._id} value={test._id}>
                                            📄 {test.title} ({test.type || 'exam'})
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {quizzes.length > 0 && (
                                <optgroup label="Speed Quizzes">
                                    {quizzes.map(test => (
                                        <option key={test._id} value={test._id}>
                                            ⚡ {test.title} ({test.type || 'quiz'})
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {others.length > 0 && (
                                <optgroup label="Other Tests">
                                    {others.map(test => (
                                        <option key={test._id} value={test._id}>
                                            📝 {test.title} ({test.type})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <ArrowLeft className="w-4 h-4 -rotate-90" />
                        </div>
                    </div>

                    {/* Helper if no tests found */}
                    {tests.length === 0 ? (
                        <div className="mt-3 flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-xs text-amber-200 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> No tests found. You can still upload to the Bank.
                            </p>
                            <Link href="/admin/tests/create" className="text-xs font-bold text-amber-400 hover:text-amber-300 underline">
                                + Create New Test
                            </Link>
                        </div>
                    ) : (
                        !selectedTestId && (
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Questions will be added to the General Bank if no test is selected.
                            </p>
                        )
                    )}
                </div>

                {/* Drop Zone */}
                {!file ? (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full max-w-xl border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer relative z-10
                            ${dragging
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-slate-700 bg-slate-950/50 hover:border-indigo-500/50 hover:bg-slate-800/50'}`}
                    >
                        <FileSpreadsheet className={`w-12 h-12 mx-auto mb-4 transition-colors ${dragging ? 'text-indigo-400' : 'text-slate-600'}`} />
                        <p className="font-bold text-slate-200 text-lg mb-2">Drop your Excel file here</p>
                        <p className="text-sm text-slate-500 mb-6">Supports .xlsx, .csv, .pdf</p>

                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls,.pdf"
                            className="hidden"
                            id="fileInput"
                            onChange={(e) => e.target.files && setFile(e.target.files[0])}
                        />
                        <label
                            htmlFor="fileInput"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl cursor-pointer shadow-lg shadow-indigo-500/25 transition-all inline-block"
                        >
                            Browse Files
                        </label>
                    </div>
                ) : (
                    <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">

                        <div className="flex items-center gap-5 mb-8">
                            <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500 border border-emerald-500/20">
                                <FileSpreadsheet className="w-8 h-8" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-bold text-lg text-white truncate">{file.name}</p>
                                <p className="text-sm text-slate-500 font-mono">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                <AlertCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Translating & Uploading...</>
                            ) : (
                                <><CheckCircle2 className="w-6 h-6" /> Upload 10,000+ Questions</>
                            )}
                        </button>
                    </div>
                )}

                <div className="mt-12 flex flex-col items-center gap-3 relative z-10">
                    <p className="text-slate-500 text-sm">Don't have the format?</p>
                    <button
                        onClick={downloadTemplate}
                        className="text-sm text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Download Official Template
                    </button>
                </div>
            </div>
        </div>
    );
}
