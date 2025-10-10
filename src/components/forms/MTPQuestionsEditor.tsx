import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MTPQuestionsEditorProps {
  metierQuestions: string[];
  talentQuestions: string[];
  paradigmeQuestions: string[];
  onMetierChange: (questions: string[]) => void;
  onTalentChange: (questions: string[]) => void;
  onParadigmeChange: (questions: string[]) => void;
  statusOfferts?: string; // "interne" ou "externe"
}

type TabType = 'metier' | 'talent' | 'paradigme';

export function MTPQuestionsEditor({
  metierQuestions,
  talentQuestions,
  paradigmeQuestions,
  onMetierChange,
  onTalentChange,
  onParadigmeChange,
  statusOfferts,
}: MTPQuestionsEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('metier');
  
  // Déterminer le nombre de questions recommandées selon le statut
  const isExterne = statusOfferts === 'externe';
  const recommendedMetier = isExterne ? 3 : 7;
  const recommendedTalent = 3;
  const recommendedParadigme = 3;
  
  const addQuestion = (category: TabType) => {
    if (category === 'metier') {
      onMetierChange([...metierQuestions, '']);
    } else if (category === 'talent') {
      onTalentChange([...talentQuestions, '']);
    } else {
      onParadigmeChange([...paradigmeQuestions, '']);
    }
  };

  const removeQuestion = (category: TabType, index: number) => {
    if (category === 'metier') {
      onMetierChange(metierQuestions.filter((_, i) => i !== index));
    } else if (category === 'talent') {
      onTalentChange(talentQuestions.filter((_, i) => i !== index));
    } else {
      onParadigmeChange(paradigmeQuestions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (category: TabType, index: number, value: string) => {
    if (category === 'metier') {
      const updated = [...metierQuestions];
      updated[index] = value;
      onMetierChange(updated);
    } else if (category === 'talent') {
      const updated = [...talentQuestions];
      updated[index] = value;
      onTalentChange(updated);
    } else {
      const updated = [...paradigmeQuestions];
      updated[index] = value;
      onParadigmeChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questions MTP (Métier, Talent, Paradigme)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ces questions seront posées au candidat lors de sa candidature. <strong>Recommandations :</strong> {recommendedMetier} questions Métier, {recommendedTalent} questions Talent, {recommendedParadigme} questions Paradigme.
            {isExterne && <span className="block mt-1 text-blue-600 font-medium">📢 Offre externe : 3 questions par catégorie</span>}
            {!isExterne && statusOfferts === 'interne' && <span className="block mt-1 text-green-600 font-medium">📢 Offre interne : 7 questions Métier, 3 Talent, 3 Paradigme</span>}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation par onglets */}
          <div className="flex justify-center border-b border-gray-200 w-full">
            <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto" aria-label="Navigation MTP">
              {/* Onglet Métier */}
              <button
                type="button"
                onClick={() => setActiveTab('metier')}
                className={`${activeTab === 'metier' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                  whitespace-nowrap py-2 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[120px]`}
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'metier' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                  M
                </div>
                <span className="hidden sm:inline">Métier</span>
                <span className="ml-1 text-xs">({metierQuestions.length})</span>
              </button>
              
              {/* Onglet Talent */}
              <button
                type="button"
                onClick={() => setActiveTab('talent')}
                className={`${activeTab === 'talent' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                  whitespace-nowrap py-2 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[120px]`}
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'talent' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>
                  T
                </div>
                <span className="hidden sm:inline">Talent</span>
                <span className="ml-1 text-xs">({talentQuestions.length})</span>
              </button>
              
              {/* Onglet Paradigme */}
              <button
                type="button"
                onClick={() => setActiveTab('paradigme')}
                className={`${activeTab === 'paradigme' 
                  ? 'border-purple-500 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                  whitespace-nowrap py-2 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[120px]`}
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'paradigme' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}>
                  P
                </div>
                <span className="hidden sm:inline">Paradigme</span>
                <span className="ml-1 text-xs">({paradigmeQuestions.length})</span>
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="mt-2 sm:mt-4">
            {/* Onglet Métier */}
            {activeTab === 'metier' && (
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-blue-200 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-blue-800 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">M</div>
                    Questions Métier
                  </h4>
                  <Button
                    type="button"
                    onClick={() => addQuestion('metier')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {metierQuestions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-sm sm:text-base text-blue-900 mb-1">
                          Question {index + 1}
                        </Label>
                        <Textarea
                          value={question}
                          onChange={(e) => updateQuestion('metier', index, e.target.value)}
                          placeholder={`Question Métier ${index + 1}`}
                          className="bg-white border-blue-300 focus:border-blue-500 min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
                          rows={2}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion('metier', index)}
                        className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-100 mt-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {metierQuestions.length === 0 && (
                    <p className="text-sm text-blue-700 italic text-center py-4">
                      Aucune question Métier. Cliquez sur "Ajouter" pour en créer.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Onglet Talent */}
            {activeTab === 'talent' && (
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-green-200 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-green-800 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">T</div>
                    Questions Talent
                  </h4>
                  <Button
                    type="button"
                    onClick={() => addQuestion('talent')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {talentQuestions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-sm sm:text-base text-green-900 mb-1">
                          Question {index + 1}
                        </Label>
                        <Textarea
                          value={question}
                          onChange={(e) => updateQuestion('talent', index, e.target.value)}
                          placeholder={`Question Talent ${index + 1}`}
                          className="bg-white border-green-300 focus:border-green-500 min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
                          rows={2}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion('talent', index)}
                        className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-100 mt-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {talentQuestions.length === 0 && (
                    <p className="text-sm text-green-700 italic text-center py-4">
                      Aucune question Talent. Cliquez sur "Ajouter" pour en créer.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Onglet Paradigme */}
            {activeTab === 'paradigme' && (
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-200 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-purple-800 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">P</div>
                    Questions Paradigme
                  </h4>
                  <Button
                    type="button"
                    onClick={() => addQuestion('paradigme')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {paradigmeQuestions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-sm sm:text-base text-purple-900 mb-1">
                          Question {index + 1}
                        </Label>
                        <Textarea
                          value={question}
                          onChange={(e) => updateQuestion('paradigme', index, e.target.value)}
                          placeholder={`Question Paradigme ${index + 1}`}
                          className="bg-white border-purple-300 focus:border-purple-500 min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
                          rows={2}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion('paradigme', index)}
                        className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-100 mt-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {paradigmeQuestions.length === 0 && (
                    <p className="text-sm text-purple-700 italic text-center py-4">
                      Aucune question Paradigme. Cliquez sur "Ajouter" pour en créer.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

