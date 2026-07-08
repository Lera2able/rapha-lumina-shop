alter table public.products
  add column if not exists size_inventory jsonb not null default '{}'::jsonb;

create or replace function decrement_stock(product_id uuid, quantity integer, selected_size text default null)
returns void
language plpgsql
security definer
as $$
declare
  current_size_stock integer;
begin
  if selected_size is not null and selected_size <> '' then
    select coalesce((size_inventory ->> selected_size)::integer, 0)
      into current_size_stock
    from products
    where id = product_id;

    update products
    set
      stock = greatest(stock - quantity, 0),
      size_inventory = jsonb_set(
        size_inventory,
        array[selected_size],
        to_jsonb(greatest(current_size_stock - quantity, 0)),
        true
      )
    where id = product_id;
  else
    update products
    set stock = greatest(stock - quantity, 0)
    where id = product_id;
  end if;
end;
$$;
