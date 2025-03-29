import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ResponsivePie
} from "@nivo/pie";
import {
  ShoppingCart,
  Home,
  Car,
  Gift,
  HeartPulse,
  PiggyBank,
  HelpCircle,
  Coffee,
  Moon,
  Sun,
  Download,
} from "lucide-react";

const categoryIcons = {
  "מזון": <Coffee className="inline w-4 h-4 ml-1" />,
  "דיור": <Home className="inline w-4 h-4 ml-1" />,
  "תחבורה": <Car className="inline w-4 h-4 ml-1" />,
  "בילויים": <Gift className="inline w-4 h-4 ml-1" />,
  "בריאות": <HeartPulse className="inline w-4 h-4 ml-1" />,
  "חיסכון": <PiggyBank className="inline w-4 h-4 ml-1" />,
  "קניות": <ShoppingCart className="inline w-4 h-4 ml-1" />,
  "מתנות": <Gift className="inline w-4 h-4 ml-1" />,
  "אחר": <HelpCircle className="inline w-4 h-4 ml-1" />
};

const categories = Object.keys(categoryIcons);

export default function FinancialManagementPlatform() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    type: "הוצאה",
    amount: "",
    category: "מזון",
    month: "3",
    tags: "",
    goalMonth: "",
    goalAmount: ""
  });

  const [darkMode, setDarkMode] = useState(false);
  const [goals, setGoals] = useState({});

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const addRecord = () => {
    if (!form.amount) return;
    setRecords([...records, {
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category,
      month: form.month,
      tags: form.tags || ""
    }]);
    setForm({ ...form, amount: "", tags: "" });
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["סוג,סכום,קטגוריה,חודש,תגיות", ...records.map(r => `${r.type},${r.amount},${r.category},${r.month},${r.tags}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthlySummary = records.reduce((acc, r) => {
    const month = r.month;
    acc[month] = acc[month] || { income: 0, expense: 0 };
    r.type === "הכנסה"
      ? (acc[month].income += r.amount)
      : (acc[month].expense += r.amount);
    return acc;
  }, {});
  return (
    <div className={`p-6 space-y-6 ${darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="flex justify-between max-w-4xl mx-auto items-center">
        <Button variant="ghost" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun className="w-5 h-5 ml-2" /> : <Moon className="w-5 h-5 ml-2" />} מצב כהה
        </Button>
        <Button onClick={exportCSV}><Download className="w-5 h-5 ml-2" /> ייצוא CSV</Button>
      </div>

      <div className="max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 p-4 rounded-xl space-y-2">
        <h3 className="text-lg font-bold">הגדרת יעד חודשי</h3>
        <div className="flex gap-4 items-center">
          <Input
            placeholder="חודש (למשל 3)"
            type="number"
            value={form.goalMonth}
            onChange={(e) => handleChange("goalMonth", e.target.value)}
          />
          <Input
            placeholder="יעד חיסכון"
            type="number"
            value={form.goalAmount}
            onChange={(e) => handleChange("goalAmount", e.target.value)}
          />
          <Button onClick={() => {
            if (!form.goalMonth || !form.goalAmount) return;
            setGoals({ ...goals, [form.goalMonth]: parseFloat(form.goalAmount) });
            setForm({ ...form, goalMonth: "", goalAmount: "" });
          }}>
            שמור יעד
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 p-4 rounded-xl space-y-4">
        <h3 className="text-lg font-bold">הוספת רשומה</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Select onValueChange={(v) => handleChange("type", v)} value={form.type}>
            <SelectTrigger><SelectValue placeholder="סוג" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="הכנסה">הכנסה</SelectItem>
              <SelectItem value="הוצאה">הוצאה</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="סכום" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} />
          <Select onValueChange={(v) => handleChange("category", v)} value={form.category}>
            <SelectTrigger><SelectValue placeholder="קטגוריה" /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{categoryIcons[cat]} {cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="חודש" value={form.month} onChange={(e) => handleChange("month", e.target.value)} />
          <Input placeholder="תגיות (לא חובה)" value={form.tags} onChange={(e) => handleChange("tags", e.target.value)} />
          <Button onClick={addRecord}>הוסף</Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <h3 className="text-xl font-bold">סיכום חודשי</h3>
        {Object.entries(monthlySummary).map(([month, data]) => {
          const net = data.income - data.expense;
          const goal = goals[month];
          const metGoal = goal ? net >= goal : null;

          return (
            <Card key={month}>
              <CardContent className="p-4 space-y-1">
                <p><strong>חודש:</strong> {month}</p>
                <p><strong>הכנסות:</strong> {data.income}</p>
                <p><strong>הוצאות:</strong> {data.expense}</p>
                <p><strong>חיסכון נטו:</strong> {net}</p>
                {goal && (
                  <p className={metGoal ? "text-green-600" : "text-red-600"}>
                    {metGoal ? "עמדת ביעד ✅" : "לא עמדת ביעד ❌"} (יעד: {goal})
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
