import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-rl-cream group-[.toaster]:text-rl-espresso group-[.toaster]:border-rl-espresso/10",
          description: "group-[.toast]:text-rl-muted",
          actionButton:
            "group-[.toast]:bg-rl-espresso group-[.toast]:text-rl-cream",
          cancelButton:
            "group-[.toast]:bg-rl-cream group-[.toast]:text-rl-muted",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
