export class ExpenseCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly expenseId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly categoryId: string | null,
    public readonly description: string | null,
    public readonly date: Date
  ) {}
}

export class ExpenseUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly expenseId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly categoryId: string | null,
    public readonly description: string | null,
    public readonly date: Date
  ) {}
}

export class ExpenseDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly expenseId: string,
    public readonly amount: number,
    public readonly currency: string
  ) {}
}
