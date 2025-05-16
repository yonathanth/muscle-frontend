import React from "react";

const TransactionTable = ({
  transactions,
  handleRowClick,
}: {
  transactions: any[];
  handleRowClick: (transaction: any) => void;
}) => {
  return (
    <div className="w-full flex h-62 md:flex-1 justify-center">
      <div className="overflow-y-auto overflow-x-auto  w-full max-h-64">
        <table className="min-w-full  text-white">
          <thead>
            <tr className="p-4 bg-[#121212] rounded-lg">
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Category
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={index}
                className="border-t border-[#333] hover:bg-[#121212] cursor-pointer"
                onClick={() => handleRowClick(transaction)}
              >
                <td
                  className={`px-4 py-2 ${
                    transaction.type === "Expense"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {transaction.name}
                </td>
                <td
                  className={`px-4 py-2 ${
                    transaction.type === "Expense"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td
                  className={`px-4 py-2 ${
                    transaction.type === "Expense"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {transaction.category}
                </td>
                <td
                  className={`px-4 py-2 ${
                    transaction.type === "Expense"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {transaction.amount} Birr
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
