import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export interface CandidateAIData {
  id: string
  fullName: string
  firstName: string
  lastName: string
  prenom?: string
  nom?: string
  poste: string
  department: string
  aiData?: {
    resume_global?: {
      score_global?: number
      rang_global?: number
      verdict?: string
      commentaire_global?: string
    }
    mtp?: {
      niveau?: string
      scores?: {
        Métier?: number
        Talent?: number
        Paradigme?: number
        Moyen?: number
      }
      score_moyen?: number
      points_forts?: string[]
      points_a_travailler?: string[]
    }
    conformite?: {
      score_conformité?: number
      commentaire?: string
    }
    similarite_offre?: {
      score?: number
      commentaire_score?: string
      resume_experience?: string
      forces?: string[]
      faiblesses?: string[]
    }
    feedback?: {
      score?: number
      points_forts?: string[]
      points_a_travailler?: string[]
    }
  }
}

// Fonction pour obtenir l'icône et le label du verdict
const getVerdictIcon = (verdict: string | undefined) => {
  if (!verdict) return { icon: "⏳", color: "text-gray-500" }
  switch (verdict.toLowerCase()) {
    case 'favorable':
    case 'retenu':
      return { icon: "✓", color: "text-green-500" }
    case 'mitigé':
    case 'à revoir':
      return { icon: "⚠", color: "text-yellow-500" }
    case 'non retenu':
    case 'défavorable':
      return { icon: "✗", color: "text-red-500" }
    default:
      return { icon: "⏳", color: "text-gray-500" }
  }
}

const getVerdictLabel = (verdict: string | undefined) => {
  if (!verdict) return 'En attente'
  const verdictLower = verdict.toLowerCase()
  if (verdictLower === 'favorable' || verdictLower === 'retenu') return 'Favorable'
  if (verdictLower === 'mitigé' || verdictLower === 'à revoir') return 'Mitigé'
  if (verdictLower === 'non retenu' || verdictLower === 'défavorable') return 'Non retenu'
  return verdict
}

const getVerdictVariant = (verdict: string | undefined): "default" | "destructive" | "outline" | "secondary" => {
  if (!verdict) return 'default'
  const verdictLower = verdict.toLowerCase()
  if (verdictLower === 'favorable' || verdictLower === 'retenu') return 'default'
  if (verdictLower === 'mitigé' || verdictLower === 'à revoir') return 'secondary'
  if (verdictLower === 'non retenu' || verdictLower === 'défavorable') return 'destructive'
  return 'outline'
}

export const createColumns = (
  onViewDetails: (candidate: CandidateAIData) => void
): ColumnDef<CandidateAIData>[] => [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Candidat
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const candidate = row.original
      return (
        <div className="font-medium break-words whitespace-normal">
          {candidate.fullName || `${candidate.firstName || candidate.prenom || 'N/A'} ${candidate.lastName || candidate.nom || 'N/A'}`.trim()}
        </div>
      )
    },
  },
  {
    accessorKey: "poste",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Poste
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="max-w-[200px] break-words whitespace-normal">
        {row.getValue("poste") || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: "score",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Score Global
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const candidate = row.original
      const score = candidate.aiData?.resume_global?.score_global || 0
      const displayScore = score > 1 ? score : score * 100
      return (
        <div className="flex items-center gap-2">
          <Progress value={displayScore} className="w-20 h-2" />
          <span className="text-sm font-medium min-w-[45px]">
            {displayScore.toFixed(1)}%
          </span>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const scoreA = rowA.original.aiData?.resume_global?.score_global || 0
      const scoreB = rowB.original.aiData?.resume_global?.score_global || 0
      return scoreA - scoreB
    },
  },
  {
    accessorKey: "verdict",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Verdict
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const verdict = row.original.aiData?.resume_global?.verdict
      const { icon, color } = getVerdictIcon(verdict)
      return (
        <Badge variant={getVerdictVariant(verdict)} className="whitespace-nowrap">
          <span className={`${color} mr-1`}>{icon}</span>
          {getVerdictLabel(verdict)}
        </Badge>
      )
    },
    sortingFn: (rowA, rowB) => {
      const verdictA = rowA.original.aiData?.resume_global?.verdict || ''
      const verdictB = rowB.original.aiData?.resume_global?.verdict || ''
      return verdictA.localeCompare(verdictB)
    },
  },
  {
    accessorKey: "mtp",
    header: "Niveau MTP",
    cell: ({ row }) => {
      const niveau = row.original.aiData?.mtp?.niveau
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {niveau || 'N/A'}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const candidate = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(candidate)}
          className="h-8 px-2"
        >
          <Eye className="h-4 w-4 mr-1" />
          Détails
        </Button>
      )
    },
  },
]

