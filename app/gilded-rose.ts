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

const MIN_QUALITY = 0;
const MAX_QUALITY = 50;

export class GildedRose {
  items: Array<Item>;

  constructor(items = [] as Array<Item>) {
    this.items = items;
  }

  updateQuality() {
    for (const item of this.items) {
      if (item.name !== AGED_BRIE && item.name !== BACKSTAGE_PASSES) {
        if (item.name !== SULFURAS) {
          decreaseQuality(item);
        }
      } else {
        increaseQuality(item);
        if (item.name === BACKSTAGE_PASSES) {
          if (item.sellIn < 11) {
            increaseQuality(item);
          }
          if (item.sellIn < 6) {
            increaseQuality(item);
          }
        }
      }
      if (item.name !== SULFURAS) {
        item.sellIn = item.sellIn - 1;
      }
      if (item.sellIn < 0) {
        if (item.name !== AGED_BRIE) {
          if (item.name !== BACKSTAGE_PASSES) {
            if (item.name !== SULFURAS) {
              decreaseQuality(item);
            }
          } else {
            item.quality = 0;
          }
        } else {
          increaseQuality(item);
        }
      }
    }

    return this.items;
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
