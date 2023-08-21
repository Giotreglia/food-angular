import { Component, numberAttribute, ChangeDetectorRef, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem} from '@angular/cdk/drag-drop';
import * as _ from "lodash";
import jsPDF, { RGBAData } from 'jspdf';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/it';
registerLocaleData(localeFr, 'it');
/* import moment from 'moment';
import domtoimage from 'dom-to-image';



@ViewChild('resultsPdf', { static: false }) public dataToExport: ElementRef; */

class Food {
  constructor(
    public id: number,
    public name: string,
    public kcal: number,
    public defaultWeight: number,
    public image: string,
    public category: string,
    public list: number
  ) {}
}

class Recipe {
  constructor(
    public id: number,
    public name: string,
    public image: string,
    public category: string,
    public list: number,
    public ingredients: Food[]
  ) {}
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  dataToExport: any;
  pdfName: any;
  todayDate = new Date().getFullYear();

  constructor(private changeDetectorRef: ChangeDetectorRef) { };



  foods: Food[] = [
    new Food(1, 'Mozzarella', 253, 100, '../../assets/mozzarella.png', 'Latticini', 1),
    new Food(2, 'Pomodoro', 19, 50, '../../assets/tomato.png', 'Vegetali', 1),
    new Food(3, 'Olio E.V.O.', 899, 6, '../../assets/oil.png', 'Condimenti', 1),
    new Food(4, 'Peperone', 25, 70, '../../assets/peperone.png', 'Vegetali', 1),
    new Food(5, 'Melanzana', 15, 80, '../../assets/melanzana.png', 'Vegetali', 1),
    new Food(6, 'Spaghetti', 356, 80, '../../assets/spaghetti.png', 'Pasta', 1),
    new Food(7, 'Penne', 356, 80, '../../assets/penne.png', 'Pasta', 1),
    new Food(8, 'Guanciale', 117, 20, '../../assets/bacon.png', 'Carne', 1),
    new Food(9, 'Uova', 128, 80, '../../assets/egg.png', 'Uova', 1),
    new Food(10, 'Pecorino', 404, 80, '../../assets/pecorino.png', 'Latticini', 1),
    new Food(11, 'Pepe', 0, 5, '../../assets/pepe.png', 'Condimenti', 1),
    new Food(12, 'Basilico', 0, 5, '../../assets/basilico.png', 'Condimenti', 1),
    new Food(13, 'Fragole', 27, 50, '../../assets/fragola.png', 'Frutta', 1),
    new Food(14, 'Gambero', 71, 50, '../../assets/gambero.png', 'Crostacei', 1),
    new Food(15, 'Lampone', 49, 50, '../../assets/lampone.png', 'Frutta', 1),
    new Food(16, 'Noci Secche', 582, 30, '../../assets/noci secche.png', 'Frutta secca', 1),
  ];

  recipes: Recipe[] = [
    new Recipe (1, 'Carbonara', '../../assets/carbonara.png', 'Primi', 1, 
          [
            new Food(6, 'Spaghetti', 356, 80, '../../assets/spaghetti.png', 'Pasta', 1),
            new Food(8, 'Guanciale', 117, 20, '../../assets/bacon.png', 'Carne', 1),
            new Food(9, 'Uova', 128, 80, '../../assets/egg.png', 'Uova', 1),
            new Food(10, 'Pecorino', 404, 80, '../../assets/pecorino.png', 'Latticini', 1),
            new Food(11, 'Pepe', 0, 5, '../../assets/pepe.png', 'Condimenti', 1),
          ] 
    ),
    new Recipe (1, 'Cacio e pepe', '../../assets/cacioepepe.png', 'Primi', 1, 
          [
            new Food(6, 'Spaghetti', 356, 80, '../../assets/spaghetti.png', 'Pasta', 1),
            new Food(10, 'Pecorino', 404, 80, '../../assets/pecorino.png', 'Latticini', 1),
            new Food(11, 'Pepe', 0, 5, '../../assets/pepe.png', 'Condimenti', 1),
          ] 
    ),

  ];

  // Array per la visualizzazione dei risultati filtrati
  filteredFoods: any = this.foods;
  filteredAndVisibleFoods: any[] = this.foods;

  // Array per le categorie di ingredienti/ricette
  foodCategories: any = [];

  // Flag per commutare tra ingredienti e ricette
  listSwitch: boolean = true;

  // Valore per il filtro di valore EV
  filterEvValue: number = 0;

  // Input per valori nuova ricetta
  newRecipeName: string = '';
  recipeImage: string = '';

  // Switch per apertura popup elementi
  overlay: boolean = false;

  // Valori EF per 100kcal
  CF: any = 0.933; // Kg co2
  WF: any = 494; // L
  EF: any = 6.06; // mq

  overlaySwitch() {
    this.overlay = this.overlay? false : true;
  }

  // Commuta la visualizzazione tra ingredienti e ricette
  switchTrue() {
    this.listSwitch = true;
    this.filteredFoods = this.foods;
    this.getCategories();
    this.resetFilters();
    console.log(this.done);
  }

  switchFalse() {
    this.listSwitch = false;
    this.filteredFoods = this.recipes;
    this.getCategories();
    this.resetFilters();
    console.log(this.done);
  }

  // Trasforma le categorie in lettere minuscole
  toLowercaseCategories() {
    this.filteredFoods.forEach((element: any) => {
      element.category.toLowerCase();
    });
  }

  // Ottiene le categorie univoche in base agli elementi filtrati
  getCategories() {
    if (this.listSwitch) {
      this.foodCategories = [];
      this.foods.forEach(element => {
        if (!this.foodCategories.includes(element.category)) {
          this.foodCategories.push(element.category);
        }
      });
      console.log(this.foodCategories);
    } else if (!this.listSwitch) {
      this.foodCategories = [];
      this.recipes.forEach(element => {
        if (!this.foodCategories.includes(element.category)) {
          this.foodCategories.push(element.category);
        }
      });
      console.log(this.foodCategories);
    }
  }

  // Eseguito all'inizio
  ngOnInit() {
    this.getCategories();
    this.toLowercaseCategories();
  }

  // Array per gli ingredienti o le ricette selezionati
  done: any[] = [];
  weight: any = 0;

  // Filtro per nome e categoria
  filterName: string = '';
  filterCategory: string = '';


  totalCF: number = 0;
  totalEF: number = 0;
  totalWF: number = 0;

  // Calcola il peso totale in base agli ingredienti/ricette selezionati
  getFootprint(element: {
    name: string; defaultWeight : number; kcal: number
}, naturalElement: number) {
    let footPrintPerGram;
    let footPrint;
    footPrintPerGram = (naturalElement * (element.kcal / 100)) / 100;
/*     console.log('foodname: ' + element.name);
    console.log(naturalElement + ' footPrintPerGram: ' + footPrintPerGram);
 */    footPrint = footPrintPerGram * element.defaultWeight;
/*     console.log('footPrint: ' + footPrint);
 */    return footPrint;
  }

  getTotalWeight() {
    let totalWeight:number = 0;
    this.totalCF = 0;
    this.totalEF = 0;
    this.totalWF = 0;
      this.done.forEach(element => {
      if (element instanceof Recipe) {
        element.ingredients.forEach(food => {
          this.totalCF += (this.getFootprint(food, this.CF));
          /* console.log(food.name + ' ' + 'CF' + ' ' + this.totalCF) */
          this.totalEF += (this.getFootprint(food, this.EF));
          /* console.log(food.name + ' ' + 'EF' + ' ' + this.totalEF) */
          this.totalWF += (this.getFootprint(food, this.WF));
          /* console.log(food.name + ' ' + 'WF' + ' ' + this.totalWF) */
          totalWeight += this.totalCF + this.totalEF + this.totalWF;
/*           console.log(totalWeight);  */
        });
      } else if (element instanceof Food) {
        this.totalCF += (this.getFootprint(element, this.CF));
        this.totalEF += (this.getFootprint(element, this.EF));
        this.totalWF += (this.getFootprint(element, this.WF));
        totalWeight += this.totalCF + this.totalEF + this.totalWF; 
      }
    });
    
    return totalWeight;

  }
  
  getTotalFootprint(naturalElement : number) {
    let totalFP: number = 0;
    this.done.forEach(element => {
      if (element instanceof Recipe) {
        element.ingredients.forEach((element) => {
          totalFP += (this.getFootprint(element, naturalElement));
        });
      } else if (element instanceof Food) {
        totalFP += (this.getFootprint(element, naturalElement));
      }
    })
    return totalFP;
  }

  getTotalKcal() {
    let totalKcal: number = 0;
    this.done.forEach(element => {
      if (element instanceof Recipe) {
        element.ingredients.forEach((food) => {
          totalKcal += (food.kcal / 100) * food.defaultWeight;
        });
      } else if (element instanceof Food) {
        totalKcal += (element.kcal / 100) * element.defaultWeight;
      }
    })
    return totalKcal;
  }

  // Gestisce l'evento di trascinamento
  drop(event: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.weight = this.getTotalWeight();
      this.setScale();
    }
  };

  // Variabile per la scala della rappresentazione umana
  translate: any = 'translateX(-50%)';
  scaleValue: any = 0;
  scaleString: any = `scale(${this.scaleValue})`;
  scale: any = `${this.translate} ${this.scaleString}`;
  scaleHeight: string = '0';

  // Imposta la scala in base al peso totale
  setScale() {
    console.log(this.scale)
    console.log(this.weight)
    if (this.weight > 0) {
      this.scaleValue = this.weight / 50;
      this.scaleString = `scale(${1 + this.scaleValue / 300})`;
    } else {
      this.scaleString = 'scale(0)';
    }
    this.scale = `${this.translate} ${this.scaleString}`;
    return this.scale;
  }

  // Aggiorna il peso e la scala
  setScaleHeight() {
    if (this.weight > 0) {
      this.scaleHeight = `scale(${this.weight / 30})`;
    } else {
      this.scaleHeight = 'scale(0)';
    }
    return this.scaleHeight;
  }

  setWeightAndScale() {
    this.weight = this.getTotalWeight();
    this.setScale();
  }

  // verifica se nelle ricette c'è già una ricetta con lo stesso nome
  hasRecipeWithName(name: string) {
    return this.recipes.some(recipe => recipe.name === name);
  }

  // Rimuove un alimento dagli ingredienti/ricette selezionati
  removeFood(item: any, i: any) {

    let recipe: any;
    recipe = _.cloneDeep(item);

    if (item instanceof Food) {
      this.done.splice(i, 1);
      this.setWeightAndScale();
    } else if (item instanceof Recipe) {
      this.done[0].ingredients.splice(i, 1);
      this.setWeightAndScale();
    }
  }

  // Funzione per capitalizzare la prima lettera di una stringa
  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // FILTRI

  // Per categoria
  filterFoodsByCategory() {

    if (this.filterCategory != '') {

      this.filteredFoods = this.filteredFoods.filter((food: { category: string; }) => {

        return food.category === this.filterCategory;
      });

    } else if (this.filterCategory == '') {

      if (this.listSwitch) {
        this.filteredFoods = this.foods;
      } else if (!this.listSwitch) {
        this.filteredFoods = this.recipes;
      }
    }

  }

  // Per nome
  filterFoodsByName() {

    if (this.filterName != '') {
      this.filteredFoods = this.filteredFoods.filter((food: { name: string; }) => {

        return food.name.toLowerCase().includes(this.filterName.toLowerCase());

      });
    } else if (this.filterName == '') {

      if (this.listSwitch) {
        this.filteredFoods = this.foods;
      } else if (!this.listSwitch) {
        this.filteredFoods = this.recipes;
      }
    }

  }

  // Per valore EV
  filterFoodsByEvValue() {
    if (this.filterEvValue > 0) {
      this.filteredFoods = this.filteredFoods.filter((food: { kcal: number; }) => {
        return food.kcal >= this.filterEvValue;
      });
    } else if (this.filterEvValue == 0) {
      this.filteredFoods = this.foods;
    }

  }

  // Funzione di reset filtri
  resetFilters() {
    this.filterCategory = "";
    this.filterEvValue = 0;
    this.filterName = "";
    if (this.listSwitch) {
      this.filteredAndVisibleFoods = this.foods;
    } else if (!this.listSwitch) {
      this.filteredAndVisibleFoods = this.recipes;
    }
  }

  resetPlate() {
      this.done.forEach(element => {
        if (element instanceof Food && !this.foods.includes(element)) {
          this.foods.push(element);
        }
    });
    this.done =[]; 
    this.setWeightAndScale();
  }

  softDeleteRecipe(name: any) {
    this.recipes.forEach((element, i) => {
      if (element.name == name) {
        this.recipes.splice(i, 1);
      }
    });
  }

  deleteRecipe(name: any) {
    this.recipes.forEach((element, i) => {
      if (element.name == name) {
        this.recipes.splice(i, 1);
        this.resetPlate();
      }
    });
    this.resetPlate();
  }

  setRecipeImage() {
    if (this.recipeImage) {
      return this.recipeImage;
    } else {
      return '../../assets/plateholder.png';
    }
  }

  saveRecipe() {
    let id: number = 1;
    let name: string = this.newRecipeName;
    let image: string = this.setRecipeImage();
    let list: number = 1;
    let category: string = 'Pasta';

    let ingredients: Food[] = [];
    
    this.done.forEach(element => {
      if (element instanceof Recipe) {
        element.ingredients.forEach(ingredient => {
          ingredients.push(ingredient);
        });
      } else if (element instanceof Food) {
        ingredients.push(element);
      }
    });

    let recipe = new Recipe(id, name, image, category, list, ingredients);
    this.recipes.push(recipe);

    this.setWeightAndScale();
    this.done = [];
    this.setWeightAndScale();
    this.newRecipeName = '';
    this.recipeImage = '';
  }

  // Funzione per chiamare tutti i filtri
  filterFoods() {
  if (this.listSwitch) {
    this.filterFoodsByEvValue();
    if (this.filterName != '') {
      this.filterFoodsByName();
    }
    if (this.filterCategory != '') {
      this.filterFoodsByCategory();
    }
  } else if (!this.listSwitch) {
    if (this.filterName != '') {
      this.filterFoodsByName();
    }
    console.log(this.filteredFoods);
    if (this.filterCategory != '') {
      this.filterFoodsByCategory();
    }

  }
  
    this.filteredAndVisibleFoods = _.cloneDeep(this.filteredFoods);
  
    // Forza l'aggiornamento della vista
    this.changeDetectorRef.markForCheck();
  }

/*   public downloadAsPdf(): void {
    const width = this.dataToExport.nativeElement.clientWidth;
    const height = this.dataToExport.nativeElement.clientHeight + 40;
    let orientation = '';
    let imageUnit = 'pt';
    if (width > height) {
    orientation = 'l';
    } else {
    orientation = 'p';
    }
    domtoimage
    .toPng(this.dataToExport.nativeElement, {
    width: width,
    height: height
    })
    .then((result: any) => {
    let jsPdfOptions: any = {
    orientation: orientation,
    unit: imageUnit,
    format: [width + 50, height + 220]
    };
    const pdf = new jsPDF(jsPdfOptions);
    pdf.setFontSize(48);
    pdf.setTextColor('#2585fe');
    pdf.text(this.pdfName.value ? this.pdfName.value.toUpperCase() : 'Untitled dashboard'.toUpperCase(), 25, 75);
    pdf.setFontSize(24);
    pdf.setTextColor('#131523');
    pdf.text('Report date: ' + moment().format('ll'), 25, 115);
    pdf.addImage(result, 'PNG', 25, 185, width, height);
    pdf.save('file_name'+ '.pdf');
    })
    .catch((error: any) => {
    });
    } */
  
  
}


