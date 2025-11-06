export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      flashcard_sets: {
        Row: {
          id: string;
          user_id: string;
          topic: string;
          raw_text: string | null;
        };
      };
      flashcards: {
        Row: {
          id: string;
          set_id: string;
          question: string;
          answer: string;
        };
      };
    };
  };
}
