// https://shadcnui-expansions.typeart.cc/docs/multiple-selector/docs/multiple-selector
'use client';

import { Command as CommandPrimitive } from 'cmdk';
import { X } from 'lucide-react';
import * as React from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;
  [key: string]: string | boolean | undefined;
}
interface GroupOption {
  [key: string]: Option[];
}

interface MultipleSelectorProps {
  value?: Option[];
  defaultOptions?: Option[];
  options?: Option[];
  placeholder?: string;
  hidePlaceholderWhenSelected?: boolean;
  onChange?: (options: Option[]) => void;
  disabled?: boolean;
  delay?: number;
  triggerSearchOnFocus?: boolean;
  onSearch?: (value: string) => Promise<Option[]>;
  onSearchSync?: (value: string) => Option[];
  creatable?: boolean;
  groupBy?: string;
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  selectFirstItem?: boolean;
  className?: string;
  badgeClassName?: string;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>, 'value' | 'placeholder' | 'disabled'>;
  hideClearAllButton?: boolean;
}

export const MultipleSelector = forwardRef<HTMLDivElement, MultipleSelectorProps>(
  (
    {
      value = [],
      defaultOptions = [],
      options = [],
      placeholder = '',
      hidePlaceholderWhenSelected = false,
      onChange,
      disabled = false,
      delay = 500,
      triggerSearchOnFocus = false,
      onSearch,
      onSearchSync,
      creatable = false,
      groupBy,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      loadingIndicator,
      emptyIndicator,
      selectFirstItem = true,
      className,
      badgeClassName,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    },
    ref
  ) => {
    const [selected, setSelected] = useState<Option[]>(value);
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [arrayOptions, setArrayOptions] = useState<Option[]>(options.length ? options : defaultOptions);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [onScrollbar, setOnScrollbar] = useState(false);

    useEffect(() => {
      setSelected(value);
    }, [value]);

    useEffect(() => {
      if (options.length) setArrayOptions(options);
    }, [options]);

    useEffect(() => {
      if (!onSearch) return;
      if (!open && !triggerSearchOnFocus) return;
      if (!inputValue && !triggerSearchOnFocus) return;
      setIsLoading(true);
      onSearch(inputValue).then((opts) => {
        setArrayOptions(opts);
        setIsLoading(false);
      });
    }, [inputValue, open, onSearch, triggerSearchOnFocus]);

    const groupOption: GroupOption = React.useMemo(() => {
      if (!groupBy) return { '': arrayOptions };
      return arrayOptions.reduce((acc, option) => {
        const key = (option[groupBy] as string) || '';
        if (!acc[key]) acc[key] = [];
        acc[key].push(option);
        return acc;
      }, {} as GroupOption);
    }, [arrayOptions, groupBy]);

    const selectables = React.useMemo<GroupOption>(
      () => {
        const clone = JSON.parse(JSON.stringify(groupOption)) as GroupOption;
        for (const [key, value] of Object.entries(clone)) {
          clone[key] = value.filter((val) => !selected.find((p) => p.value === val.value));
        }
        return clone;
      },
      [groupOption, selected]
    );

    function handleUnselect(option: Option) {
      const newSelected = selected.filter((s) => s.value !== option.value);
      setSelected(newSelected);
      onChange?.(newSelected);
    }

    function handleSelect(option: Option) {
      if (selected.length >= maxSelected) {
        onMaxSelected?.(maxSelected);
        return;
      }
      const newSelected = [...selected, option];
      setSelected(newSelected);
      onChange?.(newSelected);
      setInputValue('');
    }

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <Command ref={dropdownRef} {...commandProps} className="w-full">
          <div
            className={cn(
              'min-h-10 rounded-md border border-input text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm',
              'flex flex-wrap items-center gap-1 px-3 py-2',
              className
            )}
            onClick={() => {
              if (disabled) return;
              inputRef.current?.focus();
            }}
          >
            {selected.map((option) => (
              <Badge
                key={option.value}
                className={cn('flex items-center gap-1', badgeClassName)}
                data-fixed={option.fixed}
                data-disabled={disabled || undefined}
              >
                {option.label}
                <button
                  type="button"
                  className={cn('ml-1 rounded-full focus:outline-none', (disabled || option.fixed) && 'hidden')}
                  onClick={() => handleUnselect(option)}
                  tabIndex={-1}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
              className={cn('flex-1 bg-transparent outline-none placeholder:text-muted-foreground', inputProps?.className)}
            />
            <button
              type="button"
              onClick={() => {
                setSelected(selected.filter((s) => s.fixed));
                onChange?.(selected.filter((s) => s.fixed));
              }}
              className={cn('absolute right-2 h-6 w-6 p-0', (hideClearAllButton || disabled || selected.length < 1 || selected.filter((s) => s.fixed).length === selected.length) && 'hidden')}
            >
              <X />
            </button>
          </div>
          {open && (
            <CommandList className="absolute z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                Object.entries(selectables).map(([key, dropdowns]) => (
                  <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                    {dropdowns.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        disabled={option.disable}
                        onSelect={() => handleSelect(option)}
                        className={cn('cursor-pointer', option.disable && 'cursor-default text-muted-foreground')}
                      >
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))
              )}
            </CommandList>
          )}
        </Command>
      </div>
    );
  }
);

MultipleSelector.displayName = 'MultipleSelector';

export default MultipleSelector; 