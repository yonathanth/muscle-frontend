"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import LoadingPage from "../loading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ChartDataItem = {
  category: string;
  value: number;
  fill: string;
};

const membershipColorMap: Record<string, string> = {
  "Body Building": "#4A90E2",
  "Group Fitness": "#7ED321",
  Exercise: "#D0021B",
  "Personal Training": "#F8E71C",
  Gym: "#F5A623",
};

const statusColorMap: Record<string, string> = {
  Active: "#7ED321",
  Inactive: "#D0021B",
  Dormant: "#F5A623",
  Frozen: "#4A90E2",
  Expired: "#9B59B6",
  Pending: "#F8E71C",
};

const chartConfig = {
  bodyBuilding: { label: "Body Building", color: "#4A90E2" },
  groupAerobics: { label: "Group Aerobics", color: "#7ED321" },
  exercise: { label: "Exercise", color: "#D0021B" },
  personalTraining: { label: "Personal Training", color: "#F8E71C" },
} satisfies ChartConfig;

const PieChartComponent: React.FC = () => {
  const token = localStorage.getItem("token");
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"membership" | "status">(
    "membership"
  );

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `${NEXT_PUBLIC_API_BASE_URL}/api/dashboard/pieChartData?type=${viewType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          const breakdown = response.data.data.breakdown;
          const colorMap =
            viewType === "membership" ? membershipColorMap : statusColorMap;
          const formattedData = breakdown.map((item: any) => ({
            category: item.category,
            value: item.memberCount,
            fill: colorMap[item.category] || "#cccccc",
          }));
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [viewType]);

  const totalValue = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.value, 0),
    [chartData]
  );

  if (loading) {
    return (
      <p className="text-center text-white">
        <LoadingPage />
      </p>
    );
  }

  return (
    <Card className="border-none bg-[#121212] text-white w-full max-w-4xl mx-auto relative">
      <div className="absolute top-1 md:top-4 right-1 md:right-4 ">
        <select
          value={viewType}
          onChange={(e) =>
            setViewType(e.target.value as "membership" | "status")
          }
          className="text-gray-400 bg-[#121212] border border-gray-500 px-3 py-1 rounded-full text-sm cursor-pointer focus:ring-customBlue-500 focus:border-customBlue-500 hover:bg-gray-800 active:bg-gray-700"
        >
          <option
            value="membership"
            className="bg-[#121212] text-white hover:bg-gray-800"
          >
            By Membership
          </option>
          <option
            value="status"
            className="bg-[#121212] text-white hover:bg-gray-800"
          >
            By Status
          </option>
        </select>
      </div>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-12">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Member Distribution</h2>
          </div>
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full max-w-[220px] h-[220px]"
          >
            <PieChart width={220} height={220}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent className="p-1" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="category"
                innerRadius={60}
                outerRadius={90}
                stroke="none"
              >
                <Label
                  content={({ viewBox }) =>
                    viewBox && "cx" in viewBox && "cy" in viewBox ? (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-white"
                      >
                        <tspan
                          dy="-1.5em"
                          className="fill-white text-base font-medium"
                        >
                          Total
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          dy="1.5em"
                          className="fill-white text-base font-medium"
                        >
                          Members
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          dy="2em"
                          className="fill-white text-sm font-light"
                        >
                          {totalValue}
                        </tspan>
                      </text>
                    ) : null
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className="space-y-2">
          {chartData.map((entry) => (
            <div
              key={entry.category}
              className="flex justify-between items-center"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-5 h-5 rounded-sm"
                  style={{ backgroundColor: entry.fill }}
                ></span>
                <span>{entry.category}</span>
              </div>
              <span className="font-extralight">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChartComponent;
