alter table public.products
  add column if not exists sale_enabled boolean not null default false,
  add column if not exists sale_price numeric(10,2),
  add column if not exists sale_start_date date,
  add column if not exists sale_end_date date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_sale_price_nonnegative'
  ) then
    alter table public.products
      add constraint products_sale_price_nonnegative
      check (sale_price is null or sale_price >= 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_sale_dates_valid'
  ) then
    alter table public.products
      add constraint products_sale_dates_valid
      check (
        sale_start_date is null
        or sale_end_date is null
        or sale_end_date >= sale_start_date
      );
  end if;
end $$;
