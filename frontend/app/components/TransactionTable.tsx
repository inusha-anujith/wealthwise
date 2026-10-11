/*
 * 'use client' is required here because we are adding user interactivity (onClick events).
 * This tells Next.js to ship the necessary JavaScript to the browser to handle the button clicks.
 */
"use client";

import { useRouter } from "next/navigation";

// Defining the exact shape of our Java data ensures type safety across the stack.
type Transaction = {
  id: number;
  amount: number;
  type: string;
  category: string;
  transactionDate: string;
};

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();

  // Using the array .reduce() method efficiently calculates running totals directly on the frontend.
  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  /*
   * This async handler fires the HTTP DELETE request to the Spring Boot REST API.
   * On success, router.refresh() triggers Next.js to fetch the latest database state without a full page reload.
   */
  const handleDelete = async (id: number) => {
    const res = await fetch(`http://localhost:8080/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* NEW: Dynamic Header Panel showing Live Totals */}
      <div className="bg-emerald-800 p-4 text-white flex justify-between items-center">
        <h3 className="font-bold">Transaction History</h3>
        <div className="flex gap-4 text-sm font-medium">
          <span className="bg-emerald-700 px-3 py-1 rounded-full">In: LKR {totalIncome.toLocaleString()}</span>
          <span className="bg-red-500 px-3 py-1 rounded-full text-white">Out: LKR {totalExpenses.toLocaleString()}</span>
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Category</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Type</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
            {/* NEW: Action column for the delete button */}
            <th className="p-4 text-sm font-semibold text-gray-600 text-center">Action</th>
          </tr>
        </thead>
        
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="p-4 text-sm text-gray-600">{t.transactionDate}</td>
              <td className="p-4 text-sm text-gray-800 font-medium">{t.category}</td>
              <td className="p-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {t.type}
                </span>
              </td>
              <td className="p-4 text-sm font-bold text-gray-800">LKR {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              
              {/* NEW: The interactive Delete Button cell */}
              <td className="p-4 text-center">
                <button 
                  onClick={() => handleDelete(t.id)} 
                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors" 
                  title="Delete Transaction"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="p-6 text-center text-gray-500">No transactions recorded yet.</div>
      )}
    </div>
  );
}