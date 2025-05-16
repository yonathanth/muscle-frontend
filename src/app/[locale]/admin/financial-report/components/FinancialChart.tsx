import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FinancialChart = ({ data }: { data: any[] }) => {
  // Preprocess the data: Set negative values for expenses
  const processedData = data.map((entry) => ({
    ...entry,
    amount: entry.type === "Expense" ? -entry.amount : entry.amount,
  }));

  // Custom tooltip renderer
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const transaction = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "#121212",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "8px",
            color: "#fff",
          }}
        >
          <p>{new Date(transaction.createdAt).toLocaleString()}</p>
          <p>Amount: {transaction.amount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={processedData.reverse()} width={970} height={300}>
        <CartesianGrid
          stroke="#333"
          strokeDasharray="4 4"
          strokeOpacity={0.3}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#00bfff"
          dot={{ r: 5, fill: "#00bfff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FinancialChart;
