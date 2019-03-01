# Triq'o loto


* npm i
* npm run pkg

### Fonctionnement

Le répertoire dist contient un exécutable pour win 64 bits ou linux 64 bits. Lancer l'exécutable, choisissez vos options (nombre de cartes, résolution (attention les perfs si trop élevé), et la taille des lots (attention la mémoire si trop élevé)) . Hormis pour le nombre de cartes, les valeurs par défaut devraient faire l'affaire. Un fichier ouput.pdf est généré dans le répertoire d'exécution. Pour personnaliser les cartes, il suffit de créer un répertoire **pub** et d'y mettre les images 1.jpg, 2.jpg, 3.jpg. Ces images, si présentes, seront insérées aux lignes 1, 2 et 3 respectivement et une seule fois dans la première case libre rencontrée.

### Règles

Lors d'un run, il est garanti qu'aucune carte n'a de ligne en commun avec une autre. Par ailleurs, il ne peut y avoir deux fois le même nombre dans une même carte.
