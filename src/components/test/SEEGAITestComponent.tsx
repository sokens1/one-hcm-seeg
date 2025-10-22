import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSEEGAIData } from '@/hooks/useSEEGAIData';
import { Loader2, CheckCircle, XCircle, Search, Brain } from 'lucide-react';

export function SEEGAITestComponent() {
  const {
    data,
    isLoading,
    error,
    isConnected,
    searchCandidates,
    analyzeCandidate,
    processCandidate,
    loadAIData,
    checkConnection
  } = useSEEGAIData();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchCandidates(searchTerm);
      setSearchResults(results);
      setTestResults(prev => ({ ...prev, search: { success: true, results } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, search: { success: false, error: error.message } }));
    } finally {
      setIsSearching(false);
    }
  };

  const handleTestConnection = async () => {
    const connected = await checkConnection();
    setTestResults(prev => ({ ...prev, connection: { success: connected } }));
  };

  const handleTestAnalyze = async () => {
    try {
      const result = await analyzeCandidate('test-candidate-id');
      setTestResults(prev => ({ ...prev, analyze: { success: true, result } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, analyze: { success: false, error: error.message } }));
    }
  };

  const handleTestProcess = async () => {
    try {
      const result = await processCandidate('test-candidate-id', 'Test Job');
      setTestResults(prev => ({ ...prev, process: { success: true, result } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, process: { success: false, error: error.message } }));
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Test API SEEG AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut de connexion */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Statut API:</span>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connectée' : 'Déconnectée'}
            </Badge>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Tests de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleTestConnection} variant="outline">
              Tester la connexion
            </Button>
            <Button onClick={loadAIData} variant="outline">
              Charger les données IA
            </Button>
          </div>

          {/* Recherche */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test de recherche</label>
            <div className="flex gap-2">
              <Input
                placeholder="Nom du candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Rechercher
              </Button>
            </div>
          </div>

          {/* Tests avancés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleTestAnalyze} variant="outline">
              Tester l'analyse IA
            </Button>
            <Button onClick={handleTestProcess} variant="outline">
              Tester le traitement IA
            </Button>
          </div>

          {/* Résultats des tests */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Résultats des tests:</h4>
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {getStatusIcon(result.success)}
                  <span className="text-sm font-medium capitalize">{test}:</span>
                  <span className="text-sm">
                    {result.success ? 'Succès' : `Erreur: ${result.error}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Résultats de recherche:</h4>
              <div className="space-y-1">
                {searchResults.map((candidate, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                    {candidate.firstName} {candidate.lastName} - {candidate.poste}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Données chargées */}
          {data && Object.keys(data).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Données chargées:</h4>
              <div className="text-sm text-gray-600">
                {Object.keys(data).length} département(s) chargé(s)
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

