"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import TransactionModal from "./components/TransactionModal";
import FinancialChart from "./components/FinancialChart";
import TransactionTable from "./components/TransactionTable";
import { Island_Moments } from "next/font/google";
import SmallLoading from "../components/SmallLoading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface transaction {
  name: string;
  category: string;
  amount: number;
  type: string;
  createdAt: string;
}
const FinancialReport = () => {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [net, setNet] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    name: "",
    category: "",
    amount: "",
    type: "Expense",
  });
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState("Expense");

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [filter, setFilter] = useState("monthly");
  const token = localStorage.getItem("token");

  const apiUrl = `${NEXT_PUBLIC_API_BASE_URL}/api/finance`;

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${apiUrl}?filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;

      const sortedTransactions = data.transactions.sort(
        (a: transaction, b: transaction) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() // Ascending order
        // or
        // new Date(b.createdAt) - new Date(a.createdAt) // Descending order
      );

      // Set the sorted transactions in state
      setTransactions(sortedTransactions);
      // setTransactions(data.transactions);
      setIncome(data.summary.income);
      setExpense(data.summary.expense);
      setNet(data.summary.net);

      const filteredData = data.transactions;
      setChartData(filteredData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to load transactions. Please try again later.");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedValue(value);
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const addTransaction = () => {
    const { name, category, amount, type } = newTransaction;
    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) return;
    if (!name || !category || !amount || !type) {
      setError("All fields are required!");
      return;
    }
    setIsLoading(true);

    axios
      .post(
        apiUrl,
        {
          name,
          category,
          amount: transactionAmount.toString(),
          type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const addedTransaction = response.data.data;
        setTransactions((prev) => [...prev, addedTransaction]);

        if (type === "Income") {
          setIncome((prev) => prev + transactionAmount);
          setNet((prev) => prev + transactionAmount);
        } else {
          setExpense((prev) => prev + transactionAmount);
          setNet((prev) => prev - transactionAmount);
        }

        setChartData([...transactions, addedTransaction]);

        setNewTransaction({
          name: "",
          category: "",
          amount: "",
          type: "Expense",
        });
        setError("");

        fetchTransactions();
      })
      .catch((error) => {
        console.error("Error adding transaction:", error);
        setError("Failed to add transaction. Please try again.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="text-white p-3 md:p-6 bg-black">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Filter options */}
      <div className="p-4 bg-[#121212] rounded-lg my-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => setFilter("weekly")}
            className={`px-4 py-2 ${
              filter === "weekly" ? "bg-customBlue text-black" : ""
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilter("monthly")}
            className={`px-4 py-2 ${
              filter === "monthly" ? "bg-customBlue text-black" : ""
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setFilter("yearly")}
            className={`px-4 py-2 ${
              filter === "yearly" ? "bg-customBlue text-black" : ""
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => setFilter("all-time")}
            className={`px-4 py-2 ${
              filter === "all-time" ? "bg-customBlue text-black" : ""
            }`}
          >
            All Time
          </button>
        </div>
        <FinancialChart data={chartData} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center text-sm sm:text-lg mt-4 p-4 bg-[#121212] rounded-lg">
        <div className="text-xs sm:text-sm font-extralight">
          Income:{" "}
          <span className="text-lg sm:text-xl font-bold">{income} Birr</span>
        </div>
        <div className="text-xs sm:text-sm font-extralight mt-2 sm:mt-0">
          Expense:{" "}
          <span className="text-lg sm:text-xl font-bold">{expense} Birr</span>
        </div>
        <div className="text-xs sm:text-sm font-extralight mt-2 sm:mt-0">
          Net: <span className="text-lg sm:text-xl font-bold">{net} Birr</span>
        </div>
      </div>
      <div className="bg-black flex flex-col justify-center md:flex-row gap-6 mt-6">
        <TransactionTable
          transactions={transactions}
          handleRowClick={handleRowClick}
        />

        <div className="w-full flex md:flex-1  justify-center p-4 bg-[#121212] rounded-lg mt-10 sm:mt-0">
          <div className="w-full  p-4 bg-[#121212] rounded-lg mt-10 sm:mt-0">
            <div className="font-bold text-sm mb-2">New Transaction</div>
            <div className="flex flex-col gap-2 mb-2 text-sm font-extralight">
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={newTransaction.name}
                onChange={handleInputChange}
                className="px-3 py-2 rounded bg-[#1c1c1c] w-full focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
              />
              <input
                type="text"
                placeholder="Category"
                name="category"
                value={newTransaction.category}
                onChange={handleInputChange}
                className="px-3 py-2 rounded bg-[#1c1c1c] w-full focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
              />
              <input
                type="number"
                placeholder="Amount"
                name="amount"
                value={newTransaction.amount}
                onChange={handleInputChange}
                className="px-3 py-2 rounded bg-[#1c1c1c] w-full focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
              />
            </div>
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex flex-col lg:flex-row items-start gap-4">
                <h2 className="text-sm font-extralight">Type:</h2>
                <label className="text-sm font-extralight flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="Expense"
                    checked={selectedValue === "Expense"}
                    onChange={handleInputChange}
                    className="form-checkbox w-5 h-5 border-2 border-customBlue rounded text-customBlue"
                  />
                  Expense
                </label>
                <label className="text-sm font-extralight flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="Income"
                    checked={selectedValue === "Income"}
                    onChange={handleInputChange}
                    className="form-checkbox w-5 h-5 border-2 border-customBlue rounded text-customBlue"
                  />
                  Income
                </label>
                <p
                  className={`text-sm ${
                    newTransaction.type === "Income"
                      ? "text-green-500"
                      : "text-red-400"
                  }`}
                >
                  {newTransaction.type}
                </p>
              </div>
              <button
                className="px-6 py-2 rounded bg-customBlue text-sm text-black font-bold w-full lg:w-auto"
                onClick={addTransaction}
                disabled={isLoading}
              >
                {isLoading ? <SmallLoading /> : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal
          transaction={selectedTransaction}
          closeModal={() => setIsModalOpen(false)}
          updateTransactions={(updatedTransaction, deleted = false) => {
            if (!updatedTransaction?.id) {
              console.error(
                "Updated transaction is invalid:",
                updatedTransaction
              );
              return;
            }

            setTransactions((prev) => {
              if (!Array.isArray(prev)) {
                console.error("Transactions state is not an array:", prev);
                return prev;
              }

              let updatedTransactions = prev;

              if (deleted) {
                updatedTransactions = prev.filter(
                  (t) => t.id !== updatedTransaction.id
                );
              } else {
                updatedTransactions = prev.map((t) =>
                  t.id === updatedTransaction.id ? updatedTransaction : t
                );
              }

              setChartData(updatedTransactions);

              return updatedTransactions;
            });

            console.log("Updated Transaction:", updatedTransaction);
          }}
        />
      )}
    </div>
  );
};

export default FinancialReport;
