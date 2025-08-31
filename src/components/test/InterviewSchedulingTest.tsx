import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInterviewScheduling } from "@/hooks/useInterviewScheduling";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function InterviewSchedulingTest() {
  const [testApplicationId, setTestApplicationId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const {
    schedules,
    isLoading,
    isSaving,
    timeSlots,
    scheduleInterview,
    cancelInterview,
    isSlotBusy,
    isDateFullyBooked,
    getAvailableSlots,
    generateCalendar
  } = useInterviewScheduling(testApplicationId);

  const handleScheduleTest = async () => {
    if (!selectedDate || !selectedTime || !testApplicationId) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const success = await scheduleInterview(selectedDate, selectedTime);
    if (success) {
      alert('Entretien programmé avec succès !');
    }
  };

  const handleCancelTest = async () => {
    if (!selectedDate || !selectedTime || !testApplicationId) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const success = await cancelInterview(selectedDate, selectedTime);
    if (success) {
      alert('Entretien annulé avec succès !');
    }
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de la Programmation d'Entretiens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ID de l'Application (pour test)
              </label>
              <input
                type="text"
                value={testApplicationId}
                onChange={(e) => setTestApplicationId(e.target.value)}
                placeholder="Entrez un ID d'application"
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={tomorrow.toISOString().split('T')[0]}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Créneau horaire
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  disabled={selectedDate ? isSlotBusy(selectedDate, time) : false}
                  className={`p-2 text-sm rounded-md border transition-colors ${
                    selectedTime === time
                      ? 'bg-blue-500 text-white border-blue-500'
                      : selectedDate && isSlotBusy(selectedDate, time)
                      ? 'bg-red-500 text-white border-red-500 cursor-not-allowed'
                      : 'bg-white hover:bg-blue-50 border-gray-300'
                  }`}
                >
                  {time}
                  {selectedDate && isSlotBusy(selectedDate, time) && ' ✕'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleScheduleTest}
              disabled={!selectedDate || !selectedTime || !testApplicationId || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Programmation...' : 'Programmer Entretien'}
            </Button>
            
            <Button 
              onClick={handleCancelTest}
              disabled={!selectedDate || !selectedTime || !testApplicationId || isSaving}
              variant="outline"
            >
              Annuler Entretien
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>État des Créneaux</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Chargement des créneaux...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun créneau programmé
                </p>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.date} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      {format(new Date(schedule.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {schedule.slots.map((slot) => (
                        <div
                          key={slot.time}
                          className={`p-2 text-sm rounded-md text-center ${
                            slot.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {slot.time}
                          <div className="text-xs">
                            {slot.isAvailable ? 'Disponible' : 'Occupé'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Application ID:</strong> {testApplicationId || 'Non défini'}
            </div>
            <div>
              <strong>Date sélectionnée:</strong> {selectedDate || 'Non définie'}
            </div>
            <div>
              <strong>Heure sélectionnée:</strong> {selectedTime || 'Non définie'}
            </div>
            <div>
              <strong>Date complètement occupée:</strong> 
              <Badge variant={selectedDate && isDateFullyBooked(selectedDate) ? 'destructive' : 'secondary'}>
                {selectedDate ? (isDateFullyBooked(selectedDate) ? 'Oui' : 'Non') : 'N/A'}
              </Badge>
            </div>
            <div>
              <strong>Créneaux disponibles:</strong> 
              {selectedDate ? getAvailableSlots(selectedDate).join(', ') : 'Aucune date sélectionnée'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
