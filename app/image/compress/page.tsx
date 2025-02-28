// Assuming necessary imports like 'Button', 'ArrowLeft', and 'router' are present.  Also assuming a CSS class 'rainbow-back-button' is defined.

<Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 -ml-2 rainbow-back-button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>