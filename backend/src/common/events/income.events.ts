export class IncomeCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly incomeId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly source: string | null,
    public readonly description: string | null,
    public readonly date: Date
  ) {}
}

export class IncomeUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly incomeId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly source: string | null,
    public readonly description: string | null,
    public readonly date: Date
  ) {}
}

export class IncomeDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly incomeId: string,
    public readonly amount: number,
    public readonly currency: string
  ) {}
}
