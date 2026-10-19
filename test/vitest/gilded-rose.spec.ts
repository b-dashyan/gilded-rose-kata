import { describe, expect, it } from 'vitest';
import { GildedRose, Item } from '@/gilded-rose';

const AGED_BRIE = 'Aged Brie';
const SULFURAS = 'Sulfuras, Hand of Ragnaros';
const BACKSTAGE_PASSES = 'Backstage passes to a TAFKAL80ETC concert';

function updateOnce(name: string, sellIn: number, quality: number): Item {
  const [item] = new GildedRose([
    new Item(name, sellIn, quality),
  ]).updateQuality();
  return item;
}

describe('Gilded Rose', () => {
  it('keeps the item name', () => {
    expect(updateOnce('foo', 0, 0).name).toBe('foo');
  });

  it('updates every item in the list', () => {
    const items = new GildedRose([
      new Item('a', 1, 1),
      new Item('b', 2, 2),
    ]).updateQuality();
    expect(items.map((i) => [i.sellIn, i.quality])).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it('handles an empty inventory', () => {
    expect(new GildedRose().updateQuality()).toEqual([]);
  });

  describe('normal items', () => {
    it('lower both sellIn and quality at the end of each day', () => {
      expect(updateOnce('Elixir', 5, 7)).toMatchObject({
        sellIn: 4,
        quality: 6,
      });
    });

    it.each([
      { sellIn: 0, expectedSellIn: -1 },
      { sellIn: -3, expectedSellIn: -4 },
    ])(
      'quality degrades twice as fast once the sell by date has passed (sellIn $sellIn)',
      ({ sellIn, expectedSellIn }) => {
        expect(updateOnce('Elixir', sellIn, 7)).toMatchObject({
          sellIn: expectedSellIn,
          quality: 5,
        });
      },
    );

    it.each([
      { sellIn: 5, quality: 0 },
      { sellIn: 0, quality: 1 },
      { sellIn: 0, quality: 0 },
    ])(
      'quality is never negative (sellIn $sellIn, quality $quality)',
      ({ sellIn, quality }) => {
        expect(updateOnce('Elixir', sellIn, quality).quality).toBe(0);
      },
    );
  });

  describe('Aged Brie', () => {
    it('increases in quality the older it gets', () => {
      expect(updateOnce(AGED_BRIE, 2, 0)).toMatchObject({
        sellIn: 1,
        quality: 1,
      });
    });

    // The requirements only say brie gains quality with age. The +2 after the
    // sell by date is legacy behaviour, pinned because the shop runs it today.
    it.each([0, -5])(
      'increases in quality twice as fast once the sell by date has passed (sellIn %i)',
      (sellIn) => {
        expect(updateOnce(AGED_BRIE, sellIn, 10).quality).toBe(12);
      },
    );

    it.each([
      { sellIn: 5, quality: 50 },
      { sellIn: 0, quality: 49 },
      { sellIn: -5, quality: 50 },
    ])(
      'quality is never more than 50 (sellIn $sellIn, quality $quality)',
      ({ sellIn, quality }) => {
        expect(updateOnce(AGED_BRIE, sellIn, quality).quality).toBe(50);
      },
    );
  });

  describe('Sulfuras', () => {
    it.each([5, 0, -1])('never has to be sold (sellIn %i)', (sellIn) => {
      expect(updateOnce(SULFURAS, sellIn, 80).sellIn).toBe(sellIn);
    });

    it.each([5, 0, -1])(
      'quality is 80 and never alters (sellIn %i)',
      (sellIn) => {
        expect(updateOnce(SULFURAS, sellIn, 80).quality).toBe(80);
      },
    );

    // Names match exactly today. Widening the match is a product decision.
    it('only Sulfuras, Hand of Ragnaros is legendary', () => {
      expect(updateOnce('Sulfuras, Blade of Fire', 5, 30)).toMatchObject({
        sellIn: 4,
        quality: 29,
      });
    });
  });

  describe('Backstage passes', () => {
    it.each([15, 11])(
      'quality increases by 1 when the concert is more than 10 days away (sellIn %i)',
      (sellIn) => {
        expect(updateOnce(BACKSTAGE_PASSES, sellIn, 20)).toMatchObject({
          sellIn: sellIn - 1,
          quality: 21,
        });
      },
    );

    it.each([10, 6])(
      'quality increases by 2 when there are 10 days or less (sellIn %i)',
      (sellIn) => {
        expect(updateOnce(BACKSTAGE_PASSES, sellIn, 20).quality).toBe(22);
      },
    );

    it.each([5, 1])(
      'quality increases by 3 when there are 5 days or less (sellIn %i)',
      (sellIn) => {
        expect(updateOnce(BACKSTAGE_PASSES, sellIn, 20).quality).toBe(23);
      },
    );

    it.each([0, -1])(
      'quality drops to 0 after the concert (sellIn %i)',
      (sellIn) => {
        expect(updateOnce(BACKSTAGE_PASSES, sellIn, 20)).toMatchObject({
          sellIn: sellIn - 1,
          quality: 0,
        });
      },
    );

    it.each([
      { sellIn: 15, quality: 50 },
      { sellIn: 10, quality: 49 },
      { sellIn: 5, quality: 49 },
      { sellIn: 5, quality: 48 },
    ])(
      'quality is never more than 50 (sellIn $sellIn, quality $quality)',
      ({ sellIn, quality }) => {
        expect(updateOnce(BACKSTAGE_PASSES, sellIn, quality).quality).toBe(50);
      },
    );

    // Names match exactly today. Widening the match is a product decision.
    it('only passes to the TAFKAL80ETC concert follow the backstage rules', () => {
      expect(
        updateOnce('Backstage passes to another concert', 5, 20),
      ).toMatchObject({
        sellIn: 4,
        quality: 19,
      });
    });
  });
});
