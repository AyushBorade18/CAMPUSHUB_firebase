
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const ITEM_TYPES = ['Electronics', 'Furniture', 'Books', 'Clothing', 'Stationery', 'Other'];

interface MarketplaceFiltersProps {
  category: 'buy-sell' | 'borrow-lend' | 'lost-found';
}

export function MarketplaceFilters({ category }: MarketplaceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.has(name, value)) {
        params.delete(name, value);
      } else {
        params.append(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );
  
  const createSingleQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );


  const handleSortChange = (value: string) => {
    router.push(pathname + '?' + createSingleQueryString('sort', value));
  };
  
  const handlePriceChange = (value: number[]) => {
     router.push(pathname + '?' + createSingleQueryString('price', `${value[0]}-${value[1]}`));
  }

  const handleCheckboxChange = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value));
  };

  const currentSort = searchParams.get('sort') || 'newest';
  const currentPriceRange = searchParams.get('price')?.split('-').map(Number) || [0, 100000];
  const currentConditions = searchParams.getAll('condition');
  const currentItemTypes = searchParams.getAll('itemType');


  return (
    <div className="sticky top-16 space-y-6">
      <div>
        <Label htmlFor="sort-by">Sort By</Label>
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger id="sort-by">
            <SelectValue placeholder="Sort items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="multiple" defaultValue={['condition', 'itemType', 'price']} className="w-full">
        {(category === 'buy-sell' || category === 'borrow-lend') && (
            <AccordionItem value="condition">
            <AccordionTrigger className="font-semibold">Condition</AccordionTrigger>
            <AccordionContent>
                <div className="space-y-2">
                {CONDITIONS.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                        id={`cond-${condition}`}
                        checked={currentConditions.includes(condition)}
                        onCheckedChange={() => handleCheckboxChange('condition', condition)}
                    />
                    <Label htmlFor={`cond-${condition}`} className="font-normal">{condition}</Label>
                    </div>
                ))}
                </div>
            </AccordionContent>
            </AccordionItem>
        )}

        <AccordionItem value="itemType">
          <AccordionTrigger className="font-semibold">Item Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {ITEM_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={currentItemTypes.includes(type)}
                    onCheckedChange={() => handleCheckboxChange('itemType', type)}
                  />
                  <Label htmlFor={`type-${type}`} className="font-normal">{type}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {category === 'buy-sell' && (
            <AccordionItem value="price">
            <AccordionTrigger className="font-semibold">Price Range</AccordionTrigger>
            <AccordionContent>
                <div className="p-2">
                    <Slider
                        defaultValue={currentPriceRange}
                        max={100000}
                        step={100}
                        onValueCommit={handlePriceChange}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>₹{currentPriceRange[0]}</span>
                        <span>₹{currentPriceRange[1] === 100000 ? '100,000+' : currentPriceRange[1]}</span>
                    </div>
                </div>
            </AccordionContent>
            </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
