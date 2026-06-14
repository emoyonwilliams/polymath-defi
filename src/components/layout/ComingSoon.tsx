import { useNavigate } from 'react-router-dom'

interface ComingSoonProps {
  section: string
  description: string
}

export const ComingSoon = ({ section, description }: ComingSoonProps) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-6">
      <div className="text-center max-w-md border border-[#1E1E2E] bg-[#0F2A22] p-12 rounded-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className="text-xs text-[#10B981] font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>Coming Soon</span>
        </div>
        
        <h1 
          className="text-4xl font-normal mb-4 text-white" 
          style={{ fontFamily: 'Lora, serif' }}
        >
          {section}
        </h1>
        
        <p 
          className="text-[#94A3B8] mb-8 leading-relaxed" 
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {description}
        </p>
        
        <button
          onClick={() => navigate('/app/dashboard')}
          className="px-8 py-3 rounded-full font-medium transition-all text-sm bg-white hover:bg-gray-200"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#000000' }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}