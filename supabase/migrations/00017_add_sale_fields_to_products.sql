alter table public.products
  add column if not exists sale_enabled boolean not null default false,
  add column if not exists sale_price numeric(10,2),
  add column if not exists sale_start_date date,
  add column if not exists sale_end_date date;

alter table public.products
  add constraint products_sale_price_nonnegative
    check (sale_price is null or sale_price >= 0);

alter table public.products
  add constraint products_sale_dates_valid
    check (
      sale_start_date is null
      or sale_end_date is null
      or sale_end_date >= sale_start_date
    );
