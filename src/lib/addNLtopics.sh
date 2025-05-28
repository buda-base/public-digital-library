#!/bin/bash

input_file="/tmp/topics.xml"
temp_file="temp_topics.xml"
output_file="topicsNL.xml"

# Ajouter des numéros de ligne
nl -ba -s' ' "$input_file" > "$temp_file"

# Utiliser awk pour ajouter l'attribut nl avec le numéro de ligne pour chaque noeud <o:node>
awk '
{

    if($0 ~ /<o:name/) $0 = tolower($0)

    if ($0 ~ /<o:node/) {
        line_number = gensub(/^ *([0-9]+)[ ]+(.*<o:node.*)/, "\\1", "g", $0)
        sub(/<o:node/, "<o:node nl=\"" line_number "\"", $0)
        $0 = gensub(/^ *[0-9]+[ ]+/, "", "g", $0)
    } else {
        $0 = gensub(/^ *[0-9]+[ ]+/, "", "g", $0)
    }
    print $0
}' "$temp_file" > "$output_file"

# Supprimer le fichier temporaire
rm "$temp_file"
