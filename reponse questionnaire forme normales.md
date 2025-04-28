Problème 1
Dans PRET1 et PRET2 la clé est {isbn, adherent} mais nom_adherent et ville_adherent ne dépendent que d’adherent : pas de 2NF. Dans PRET3 (seulement isbn, adherent, date) tout dépend de la clé : 2NF. Dans PRET4, si on considère que chaque exemplaire ne peut être prêté qu’une fois par date, exemplaire→date fait de exemplaire la clé : 2NF.

Problème 2
Pour FOURNISSEUR, si ville→pays alors n°fournisseur→ville→pays crée une dépendance transitive : pas de 3NF (sauf si noms de ville non uniques, alors 3NF). Dans les deux versions de PERSONNEL, tout dépend directement de n°agent : 3NF. Pour VOL, si modèle_avion→nombre_passagers (ou places) on a une transitive vol→modèle→passagers : pas de 3NF, sinon 3NF.

Problème 3
Avec F={A→B, A→C, A→D}, la fermeture A+={A,B,C,D} montre que A est la seule clé candidate.

Problème 4
Avec F={AC→B, BC→DE, AE→G}, on calcule (AC)+ = {A,B,C,D,E,G}. AC ne détermine pas F, donc ce n’est pas clé, mais la fermeture précise ce qu’on peut déduire.

Problème 5
En appliquant canonisation puis élimination des redondances, on obtient un recouvrement minimal équivalent :
C→A ; AB→C ; BC→D ; D→E ; D→F ; CE→F.

Problème 6
On extrait d’abord tous les attributs métiers , on identifie les dépendances fonctionnelles clés, puis on décompose en relations normalisées :
Restaurant(id,adresse,gps), Employé(id,nom), Poste(id_restaurant,id_employé,date,rôle), Plat(id,libellé), Composition(id_plat,id_ingrédient), Fournisseur, Réservation, Table, Livraison. Chaque table respecte la 1FN, 2FN, 3FN et 4FN.