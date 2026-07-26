import blackSuit from '../../public/images/black-suit.jpg';
import beigeSuit from '../../public/images/beige-suit.jpg';
import whiteSuit from '../../public/images/white-suit.jpg';

export const PRODUCT = {
  name: {
    ar: 'طقم كتان صيفي بريميوم',
    en: 'Premium Summer Linen Suit'
  },
  price: 650,
  shipping: 50,
  colors: [
    { id: 'black', label: { ar: 'أسود', en: 'Black' }, image: blackSuit.src },
    { id: 'beige', label: { ar: 'بيج', en: 'Beige' }, image: beigeSuit.src },
    { id: 'white', label: { ar: 'أبيض', en: 'White' }, image: whiteSuit.src }
  ],
  sizes: ['M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'],
  sizeChart: {
    'M': { shirtWidth: 52, shirtLength: 68, sleeve: 61, pantsLength: 98, weight: 'من 50 كيلو الى 60 كيلو' },
    'L': { shirtWidth: 54, shirtLength: 70, sleeve: 62, pantsLength: 99, weight: 'من 60 كيلو الى 70 كيلو' },
    'XL': { shirtWidth: 56, shirtLength: 70, sleeve: 63, pantsLength: 100, weight: 'من 70 كيلو الى 80 كيلو' },
    '2XL': { shirtWidth: 58, shirtLength: 72, sleeve: 63, pantsLength: 100, weight: 'من 80 كيلو الى 90 كيلو' },
    '3XL': { shirtWidth: 60, shirtLength: 72, sleeve: 64, pantsLength: 102, weight: 'من 90 كيلو الى 100 كيلو' },
    '4XL': { shirtWidth: 62, shirtLength: 75, sleeve: 65, pantsLength: 102, weight: 'من 100 كيلو الى 110 كيلو' },
    '5XL': { shirtWidth: 65, shirtLength: 76, sleeve: 66, pantsLength: 104, weight: 'من 110 كيلو الى 115 كيلو' },
    '6XL': { shirtWidth: 69, shirtLength: 78, sleeve: 68, pantsLength: 106, weight: 'من 115 كيلو الى 120 كيلو' },
  }
};
