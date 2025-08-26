import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";
import { 
  ChatMessage, 
  defaultMessages, 
  findBestResponse,
  predefinedQuestions 
} from "@/data/chatbotData";
import { cn } from "@/lib/utils";

interface ChatbotProps {
  className?: string;
}

export function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome messages
  useEffect(() => {
    if (isOpen && !showMenu && messages.length === 0) {
      const welcomeMessages: ChatMessage[] = defaultMessages.map((text, index) => ({
        id: `welcome-${index}`,
        text,
        isBot: true,
        timestamp: new Date()
      }));
      setMessages(welcomeMessages);
    }
  }, [isOpen, showMenu, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened and in chat mode
  useEffect(() => {
    if (isOpen && !isMinimized && !showMenu && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, showMenu]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const response = findBestResponse(inputValue);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2s
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Menu actions
  const handleStartChat = () => {
    setShowMenu(false);
  };

  const handleCallSupport = () => {
    window.open("tel:+241076402886", "_self");
  };

  const handleSendEmail = () => {
    window.open("mailto:support@seeg-talentsource.com?subject=Demande de support - OneHCM Talent Flow", "_self");
  };

  const handleBackToMenu = () => {
    setShowMenu(true);
    setMessages([]);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setShowMenu(true); // Toujours commencer par le menu
    }
  };

  const clearChat = () => {
    setMessages([]);
    const welcomeMessages: ChatMessage[] = defaultMessages.map((text, index) => ({
      id: `welcome-${index}`,
      text,
      isBot: true,
      timestamp: new Date()
    }));
    setMessages(welcomeMessages);
  };

  const resetToMenu = () => {
    setShowMenu(true);
    setMessages([]);
    setInputValue("");
    setIsTyping(false);
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChatbot}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          <span className="sr-only">Ouvrir le chat</span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[500px] shadow-2xl border-0 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {showMenu ? "Support SEEG" : "Assistant SEEG"}
                </h3>
                <p className="text-xs opacity-90">
                  {showMenu ? "Comment pouvons-nous vous aider ?" : "En ligne"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-blue-500/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChatbot}
                className="h-8 w-8 text-white hover:bg-blue-500/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <CardContent className="flex flex-col h-96 p-0">
              {showMenu ? (
                /* Menu Principal */
                <div className="flex flex-col h-full justify-center items-center p-6 space-y-4">
                  <div className="text-center mb-6">
                    <Bot className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Comment souhaitez-vous nous contacter ?
                    </h3>
                    <p className="text-sm text-gray-600">
                      Choisissez l'option qui vous convient le mieux
                    </p>
                  </div>
                  
                  <div className="w-full space-y-3">
                    <Button
                      onClick={handleStartChat}
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white justify-start gap-4"
                      size="lg"
                    >
                      <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Discuter avec l'assistant</p>
                        <p className="text-xs opacity-90">Chat en direct avec notre IA</p>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={handleCallSupport}
                      variant="outline"
                      className="w-full h-14 border-2 border-green-200 hover:bg-green-50 text-green-700 justify-start gap-4"
                      size="lg"
                    >
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Appeler le support</p>
                        <p className="text-xs opacity-70">+241 076402886</p>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={handleSendEmail}
                      variant="outline"
                      className="w-full h-14 border-2 border-purple-200 hover:bg-purple-50 text-purple-700 justify-start gap-4"
                      size="lg"
                    >
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Envoyer un email</p>
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Interface de Chat */
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          message.isBot ? "justify-start" : "justify-end"
                        )}
                      >
                        {message.isBot && (
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                            message.isBot
                              ? "bg-gray-100 text-gray-900"
                              : "bg-blue-600 text-white ml-auto"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.text}</p>
                          <p className={cn(
                            "text-xs mt-1 opacity-70",
                            message.isBot ? "text-gray-500" : "text-blue-100"
                          )}>
                            {message.timestamp.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                        {!message.isBot && (
                          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-2 justify-start">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="bg-gray-100 px-3 py-2 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Questions */}
                  {messages.length <= defaultMessages.length && (
                    <div className="p-3 border-t bg-gray-50">
                      <p className="text-xs text-gray-600 mb-2">Questions fréquentes :</p>
                      <div className="flex flex-wrap gap-1">
                        {predefinedQuestions.slice(0, 3).map((q) => (
                          <Button
                            key={q.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickQuestion(q.question)}
                            className="text-xs h-7 px-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            {q.question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Tapez votre message..."
                        className="flex-1 h-9 text-sm"
                        disabled={isTyping}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="h-9 w-9 bg-blue-600 hover:bg-blue-700"
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center mt-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetToMenu}
                        className="flex-1 h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      >
                        ← Retour au menu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearChat}
                        className="flex-1 h-8 text-xs font-medium border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                      >
                        🔄 Nouveau chat
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}