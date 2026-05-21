#!/bin/bash
# Script pour appliquer la migration guest orders

# Vérifier si supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "📦 Installation: npm install -g supabase"
    exit 1
fi

echo "🚀 Application de la migration guest orders..."

# Appliquer la migration
supabase migration up

if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès!"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi
