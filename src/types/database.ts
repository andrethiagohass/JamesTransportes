export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      preco_km: {
        Row: {
          id: string
          valor: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          valor: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          valor?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      preco_kg: {
        Row: {
          id: string
          valor: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          valor: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          valor?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      taxa_arrancada: {
        Row: {
          id: string
          km_inicial: number
          km_final: number
          valor: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          km_inicial: number
          km_final: number
          valor: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          km_inicial?: number
          km_final?: number
          valor?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lancamentos: {
        Row: {
          id: string
          data: string
          km_inicial: number
          km_final: number
          km_total: number
          peso: number
          valor_km: number
          valor_peso: number
          taxa_arrancada: number
          preco_total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          data: string
          km_inicial: number
          km_final: number
          km_total: number
          peso: number
          valor_km: number
          valor_peso: number
          taxa_arrancada: number
          preco_total: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          data?: string
          km_inicial?: number
          km_final?: number
          km_total?: number
          peso?: number
          valor_km?: number
          valor_peso?: number
          taxa_arrancada?: number
          preco_total?: number
          created_at?: string
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          username: string
          password_hash: string
          nome: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          nome?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          nome?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
