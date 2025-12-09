import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getMonthName, getCurrentYear } from '@/lib/utils'

interface PeriodSelectorProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

export function PeriodSelector({
  month,
  year,
  onMonthChange,
  onYearChange,
}: PeriodSelectorProps) {
  const currentYear = getCurrentYear()

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="flex gap-2">
      <Select
        value={month.toString()}
        onValueChange={(v) => onMonthChange(parseInt(v))}
      >
        <SelectTrigger className="flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={m.toString()}>
              {getMonthName(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={year.toString()}
        onValueChange={(v) => onYearChange(parseInt(v))}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
