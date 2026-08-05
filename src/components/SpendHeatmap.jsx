import { dailyHeatmap } from '../data/dummyData'

const getIntensity = (amount) => {
  if (amount === 0) return 0
  if (amount < 150) return 1
  if (amount < 350) return 2
  if (amount < 600) return 3
  return 4
}

const intensityColor = ['bg-cream/5', 'bg-gold/20', 'bg-gold/40', 'bg-gold/65', 'bg-gold']
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function SpendHeatmap() {
  return (
    <div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-2">
          {dayLabels.map((d) => (
            <span key={d} className="text-[10px] text-stone h-4 flex items-center">{d}</span>
          ))}
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {dailyHeatmap.map((amount, i) => (
            <div
              key={i}
              title={amount > 0 ? `₹${amount} spent` : 'No spend'}
              className={`w-4 h-4 rounded-sm ${intensityColor[getIntensity(amount)]} hover:ring-1 hover:ring-gold transition`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-stone">Less</span>
        {intensityColor.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
        <span className="text-[10px] text-stone">More</span>
      </div>
    </div>
  )
}

export default SpendHeatmap