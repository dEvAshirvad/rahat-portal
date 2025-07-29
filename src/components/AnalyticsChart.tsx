"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
} from "recharts";

interface AnalyticsChartProps {
	data: Array<{
		name: string;
		value: number;
		color?: string;
	}>;
	type: "bar" | "pie" | "line";
	title: string;
	dataKey: string;
	nameKey: string;
	colors?: string[];
}

export default function AnalyticsChart({
	data,
	type,
	title,
	dataKey,
	nameKey,
	colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"],
}: AnalyticsChartProps) {
	const renderChart = () => {
		switch (type) {
			case "bar":
				return (
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={data}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey={nameKey} />
							<YAxis />
							<Tooltip />
							<Bar dataKey={dataKey} fill="#0088FE" />
						</BarChart>
					</ResponsiveContainer>
				);

			case "pie":
				return (
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, percent }) =>
									`${name} ${((percent || 0) * 100).toFixed(0)}%`
								}
								outerRadius={80}
								fill="#8884d8"
								dataKey={dataKey}
								nameKey={nameKey}>
								{data.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={colors[index % colors.length]}
									/>
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				);

			case "line":
				return (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={data}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey={nameKey} />
							<YAxis />
							<Tooltip />
							<Line type="monotone" dataKey={dataKey} stroke="#0088FE" />
						</LineChart>
					</ResponsiveContainer>
				);

			default:
				return null;
		}
	};

	return (
		<Card className="bg-white shadow-lg">
			<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
				<CardTitle className="text-lg">{title}</CardTitle>
			</CardHeader>
			<CardContent className="p-4">{renderChart()}</CardContent>
		</Card>
	);
}
