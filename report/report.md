# FooDB Visualizer

**Suhayb Abunijem** SID

**Kiel Chapin-Riddle** SID

**Gabriel Simmons** 912090946

### Motivation

​		Science and medicine are experiencing a trend towards "personalized medicine" - therapies and health interventions tailored specifically to unique individuals. As personalized medicine becomes more popular, detailed knowledge of food constituents will be increasingly important. As an example, this type of knowledge will enable doctors to advise patients to avoid foods containing chemicals that may interact with their prescribed medications. It may also enable dietary recommendations to be made at the individual level, based on the prediction of how chemical food constituents will interact with each person's genome. 

​	FooDB is a dataset documenting the chemical constituents of thousands of whole foods and recipes. Our intention was to design an interface to the database that communicates the chemical composition of foods or groups of foods, as well as similarity between foods and trends among food constituents. Our intended audience is someone familiar with nutrition basics, who is looking for more detailed information about chemical food constituents. 

### Dataset and Preprocessing

​	The FooDB database is stored in several tables. The `contents` table includes one row for each known pair of a compound or nutrient and it's containing food, with columns describing information about the compound or nutrient as well as the source of the information. Other tables include more detailed information about foods, nutrients, and compounds. 

​	For our visualization we required a table with rows corresponding to individual foods, and columns corresponding to food properties. We used Python and the `pandas` library to construct this data table. This involved reformatting the `contents` table as a crosstable with rows corresponding to foods, and columns corresponding to constituents (compounds or nutrients), and then joining additional relevant information from other tables in the database. See `report/preprocessing.pdf` for more details. The resulting data table used in our visualization (`data/foods_final.csv`) contains ~760 foods and ~330 food properties. 

​	For our scatter plot visualization, we used t-SNE to represent these 300+ food properties in 2 dimensions. The t-SNE embedding was also done in Python and the results were appended as two additional columns in `foods_final.csv`.

### Summary of initial proposal

- How you initially proposed to visualize the data, and why you want to visualize it that way.

### Description of final visualization

- A description of the final visualization system, including implementation details, visual encodings, and interactions.

Design changes & design justification

- How the visualization system changed throughout the design / implementation process, such as things you tried that just didn't work.
- Justifications and explanations for changes and your team's design decisions.
- Sunburst -> Icicle
- Layout - moving the PC out of the sidebar, arrangement of the visualizations

Potential improvements

- The icicle plot and the rest of the visualizations share the same color scheme, even though the color meanings are not shared. 
- Difficult to find two unique color schemes that can encode the required number of categories without clashing aesthetically.



### Task Division

- How tasks were divided among team members.