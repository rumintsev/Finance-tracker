"use client";

import { useEffect, useState } from "react";

type Expense = {
  id: number;
  name: string;
  amount: number;
  date: string;
};

export default function Page() {
  const today = new Date().toISOString().split('T')[0];

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const loadExpenses = async (searchQuery = "") => {
    const url = searchQuery
      ? `/api/expenses/search?q=${encodeURIComponent(searchQuery)}`
      : "/api/expenses";
    const res = await fetch(url);
    const data = await res.json();
    setExpenses(searchQuery ? data : data.data);
  };

  useEffect(() => { loadExpenses(); }, []);

  const addExpense = async () => {
    if (isAdding) return;
    setIsAdding(true);

    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || `Трата ${today}`,
          amount: Number(amount) || 0,
          date: date || today,
        }),
      });

      setName("");
      setAmount("");
      setDate(today);
      await loadExpenses(search);
    } finally {
      setIsAdding(false);
    }
  };

  const updateExpense = async (id: number, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const deleteExpense = async (id: number) => {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    await loadExpenses(search);
  };

  return (
    <div>
      <div>
        <input placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Сумма" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button onClick={addExpense} disabled={isAdding}>
          {isAdding ? "Добавляем..." : "Добавить"}
        </button>
      </div>

      <input
        placeholder="Поиск..."
        value={search}
        onChange={e => { setSearch(e.target.value); loadExpenses(e.target.value); }}
      />

      <h2>{search ? "Результаты поиска:" : "5 последних трат:"}</h2>

      <div>
        {expenses.map(item => (
          <div key={item.id}>
            <input value={item.name} onChange={e => updateExpense(item.id, { name: e.target.value })} />
            <input type="number" value={item.amount} onChange={e => updateExpense(item.id, { amount: Number(e.target.value) })} />
            <input type="date" value={item.date} onChange={e => updateExpense(item.id, { date: e.target.value })} />
            <button onClick={() => deleteExpense(item.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}