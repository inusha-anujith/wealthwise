"use client"; 

import { useState } from "react";
// 1. Import useRouter from next/navigation (NOT next/router)
import { useRouter } from "next/navigation";

export default function TransactionForm() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("INCOME");
  const [category, setCategory] = useState("");
  
  // 2. Initialize the router
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    const transactionData = {
      user: { id: 1 }, 
      type,
      amount: parseFloat(amount),
      category,
      transactionDate: new Date().toISOString().split("T")[0],
    };

    const res = await fetch("http://localhost:8080/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionData),
    });

    if (res.ok) {
      // 3. Clear the form fields
      setAmount("");
      setCategory("");
      
      // 4. Force Next.js to refresh the Server Components (updates the table and savings)
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Transaction</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          type="number" 
          placeholder="Amount (LKR)" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          className="border rounded p-2" 
          required 
        />
        
        <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded p-2">
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Category (e.g. Salary)" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          className="border rounded p-2" 
          required 
        />
      </div>

      <button type="submit" className="mt-4 bg-blue-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Save Transaction
      </button>
    </form>
  );
}