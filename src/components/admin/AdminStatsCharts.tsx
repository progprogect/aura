/**
 * Графики статистики для админ-панели
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AdminStatsChartsProps {
  stats: {
    specialists: {
      byCategory: Array<{ category: string; count: number }>
    }
    charts: {
      registrationsByDay: Array<{ date: string; count: number }>
      ordersByDay: Array<{ date: string; count: number }>
    }
  }
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

export function AdminStatsCharts({ stats }: AdminStatsChartsProps) {
  // Форматируем данные для графиков
  const registrationsData = stats.charts.registrationsByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
    }),
    count: item.count,
  }))

  const ordersData = stats.charts.ordersByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
    }),
    count: item.count,
  }))

  const categoryData = stats.specialists.byCategory.map((item) => ({
    name: item.category,
    value: item.count,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* График регистраций */}
      <Card>
        <CardHeader>
          <CardTitle>Регистрации по дням</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Регистрации"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* График заказов */}
      <Card>
        <CardHeader>
          <CardTitle>Заказы по дням</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" name="Заказы" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Распределение по категориям */}
      {categoryData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Специалисты по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

