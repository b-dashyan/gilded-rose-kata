export class Item {
  name: string;
  sellIn: number;
  quality: number;

  constructor(name: string, sellIn: number, quality: number) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

const AGED_BRIE = 'Aged Brie';
const BACKSTAGE_PASSES = 'Backstage passes to a TAFKAL80ETC concert';
const SULFURAS = 'Sulfuras, Hand of Ragnaros';
const CONJURED_PREFIX = 'Conjured';

const MIN_QUALITY = 0;
const MAX_QUALITY = 50;

export class GildedRose {
  items: Array<Item>;

  constructor(items = [] as Array<Item>) {
    this.items = items;
  }

  updateQuality() {
    for (const item of this.items) {
      switch (item.name) {
        case AGED_BRIE:
          updateAgedBrie(item);
          break;
        case BACKSTAGE_PASSES:
          updateBackstagePasses(item);
          break;
        case SULFURAS:
          // Legendary: never sold, never changes
          break;
        default:
          if (item.name.startsWith(CONJURED_PREFIX)) {
            updateConjured(item);
          } else {
            updateNormalItem(item);
          }
      }
    }

    return this.items;
  }
}

function updateAgedBrie(item: Item) {
  increaseQuality(item);
  item.sellIn = item.sellIn - 1;
  if (item.sellIn < 0) {
    increaseQuality(item);
  }
}

function updateBackstagePasses(item: Item) {
  increaseQuality(item);
  if (item.sellIn < 11) {
    increaseQuality(item);
  }
  if (item.sellIn < 6) {
    increaseQuality(item);
  }
  item.sellIn = item.sellIn - 1;
  if (item.sellIn < 0) {
    item.quality = 0;
  }
}

function updateNormalItem(item: Item) {
  decreaseQuality(item);
  item.sellIn = item.sellIn - 1;
  if (item.sellIn < 0) {
    decreaseQuality(item);
  }
}

function updateConjured(item: Item) {
  decreaseQuality(item);
  decreaseQuality(item);
  item.sellIn = item.sellIn - 1;
  if (item.sellIn < 0) {
    decreaseQuality(item);
    decreaseQuality(item);
  }
}

// Quality moves one step at a time, so the guard alone keeps it within 0 to 50
function increaseQuality(item: Item) {
  if (item.quality < MAX_QUALITY) {
    item.quality = item.quality + 1;
  }
}

function decreaseQuality(item: Item) {
  if (item.quality > MIN_QUALITY) {
    item.quality = item.quality - 1;
  }
}
