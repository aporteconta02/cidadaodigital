import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-bg-elevated group-[.toaster]:text-text-primary group-[.toaster]:border-border-custom group-[.toaster]:shadow-card rounded-2xl",
          description: "group-[.toast]:text-text-secondary",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-white/5 group-[.toast]:text-text-muted",
          success: "group-[.toaster]:!bg-success group-[.toaster]:!text-white group-[.toaster]:!border-none",
          error: "group-[.toaster]:!bg-danger group-[.toaster]:!text-white group-[.toaster]:!border-none",
          info: "group-[.toaster]:!bg-primary group-[.toaster]:!text-white group-[.toaster]:!border-none",
        },
        duration: 3000,
      }}
      {...props}
    />
  );
};

export { Toaster };
