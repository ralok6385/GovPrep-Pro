"use client";

export default function RevenueChart() {
    // Mock data points
    const data = [40, 65, 45, 80, 55, 90, 70];
    const max = 100;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Revenue Analytics</h3>
                    <p className="text-sm text-slate-500">Monthly sales performance</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>This Year</option>
                    <option>Last Year</option>
                </select>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                {data.map((value, index) => (
                    <div key={index} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="relative w-full bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end group-hover:bg-slate-50 transition-colors">
                            <div
                                className="w-full bg-indigo-500 rounded-t-xl transition-all duration-500 hover:bg-indigo-600 relative group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                style={{ height: `${value}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${value}k
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][index]}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                    <span className="text-slate-600">Sales</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                    <span className="text-slate-600">Projection</span>
                </div>
            </div>
        </div>
    );
}
