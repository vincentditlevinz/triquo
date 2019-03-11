# Triq'o loto


* npm i
* npm run pkg

### Fonctionnement

Le répertoire **dist** contient un exécutable pour win 64 bits ou linux 64 bits. Lancer l'exécutable, choisissez vos options (nombre de cartes, résolution (attention les perfs si trop élevé), et la taille des lots (attention à la mémoire si trop élevé, mais cela peut accélérer le traitement par optimisation des ressources grâce au fonctionnement non bloquant de Node)). Hormis pour le nombre de cartes, les valeurs par défaut devraient faire l'affaire. Un fichier ouput.pdf est généré dans le répertoire d'exécution avec les cartes mises en page et prêtes à être imprimées.

Pour personnaliser les cartes, il suffit de créer un répertoire **pub** dans le répertoire d'exécution et d'y mettre les images 1.jpg, 2.jpg, 3.jpg. Ces images, si présentes, seront insérées aux lignes 1, 2 et 3 respectivement et une seule fois dans la première case libre rencontrée dont le numéro de colonne est supérieur ou égal au numéro de ligne, cela permettant d'éviter un alignement vertical des publicités.

Pour personnaliser les images par défaut utilisées pour les numéros de tirage, il suffit de créer un répertoire **img** dans le répertoire d'exécution et d'y mettre les images à surcharger selon le modèle <numéro>.jpg. Par exemple, les images 10.jpg et 90.jpg surchargent les images par défaut des numéros 10 et 90 respectivement.

### Règles

* Les numéros de tirage vont de 1 à 90.
* Il y a cinq numéros par ligne.
* Il ne peut y avoir deux fois le même nombre dans une même carte.
* Lors d'un run, il est garanti qu'aucune carte n'a de ligne en commun avec une autre. 