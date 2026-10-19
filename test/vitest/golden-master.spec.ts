import { describe, expect, it } from 'vitest';
import { GildedRose, Item } from '@/gilded-rose';

// This is long enough for every item to reach its final state
const DAYS = 30;

// The kata's texttest fixture plus edge cases around every boundary in the rules
function createItems(): Item[] {
  return [
    // texttest fixture
    new Item('+5 Dexterity Vest', 10, 20),
    new Item('Aged Brie', 2, 0),
    new Item('Elixir of the Mongoose', 5, 7),
    new Item('Sulfuras, Hand of Ragnaros', 0, 80),
    new Item('Sulfuras, Hand of Ragnaros', -1, 80),
    new Item('Backstage passes to a TAFKAL80ETC concert', 15, 20),
    new Item('Backstage passes to a TAFKAL80ETC concert', 10, 49),
    new Item('Backstage passes to a TAFKAL80ETC concert', 5, 49),
    new Item('Conjured Mana Cake', 3, 6),
    // normal items around the quality and sell-by boundaries
    new Item('Normal Item', 0, 0),
    new Item('Normal Item', 0, 1),
    new Item('Normal Item', 0, 2),
    new Item('Normal Item', -1, 5),
    new Item('Normal Item', 1, 50),
    // aged brie near the 50 cap and past its sell-by date
    new Item('Aged Brie', 0, 48),
    new Item('Aged Brie', 0, 49),
    new Item('Aged Brie', -5, 10),
    new Item('Aged Brie', 5, 50),
    // backstage passes at every threshold
    new Item('Backstage passes to a TAFKAL80ETC concert', 11, 10),
    new Item('Backstage passes to a TAFKAL80ETC concert', 6, 10),
    new Item('Backstage passes to a TAFKAL80ETC concert', 1, 10),
    new Item('Backstage passes to a TAFKAL80ETC concert', 0, 10),
    new Item('Backstage passes to a TAFKAL80ETC concert', 10, 48),
    new Item('Backstage passes to a TAFKAL80ETC concert', 5, 48),
    // sulfuras with a positive sellIn
    new Item('Sulfuras, Hand of Ragnaros', 5, 80),
    // conjured items around the boundaries
    new Item('Conjured Mana Cake', 0, 5),
    new Item('Conjured Mana Cake', 1, 1),
  ];
}

function simulate(days: number): string {
  const items = createItems();
  const gildedRose = new GildedRose(items);
  const lines: string[] = [];
  for (let day = 0; day <= days; day++) {
    lines.push(`-------- day ${day} --------`, 'name, sellIn, quality');
    for (const item of items) {
      lines.push(`${item.name}, ${item.sellIn}, ${item.quality}`);
    }
    lines.push('');
    gildedRose.updateQuality();
  }
  return lines.join('\n');
}

describe('Gilded Rose golden master', () => {
  it(`matches the recorded output for ${DAYS} days`, async () => {
    await expect(simulate(DAYS)).toMatchFileSnapshot(
      '__snapshots__/golden-master.txt',
    );
  });
});
