import { Download, Share2 } from 'lucide-react'
import { Button } from '../../../components/ui'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { pdf } from '@react-pdf/renderer'
import { ReportPDF } from './ReportPDF'

export function ReportActions({ result }: { result: LiveAnalysisResult }) {
  const handleDownloadPDF = async () => {
    try {
      const blob = await pdf(<ReportPDF result={result} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'manipulation-analysis-report.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Manipulation Analysis Report',
      text: result.metaJudge.summary || result.judge.reasoning,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`)
        .then(() => alert('Report summary copied to clipboard'))
        .catch(() => alert('Failed to copy to clipboard'))
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
        <Download size={14} />
        Download PDF
      </Button>
      <Button variant="secondary" size="sm" onClick={handleShare}>
        <Share2 size={14} />
        Share
      </Button>
    </div>
  )
}
