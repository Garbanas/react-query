import type { Query, FetchMoreOptions } from './query'
import type { QueryCache } from './queryCache'

export type QueryKey =
  | boolean
  | null
  | number
  | object
  | string
  | undefined
  | { [key: number]: QueryKey }
  | { [key: string]: QueryKey }
  | readonly QueryKey[]

export type ArrayQueryKey = QueryKey[]

export type QueryFunction<TResult> = (
  ...args: any[]
) => TResult | Promise<TResult>

export type TypedQueryFunction<
  TResult,
  TArgs extends TypedQueryFunctionArgs = TypedQueryFunctionArgs
> = (...args: TArgs) => TResult | Promise<TResult>

export type TypedQueryFunctionArgs = readonly [unknown, ...unknown[]]

export type InitialDataFunction<TResult> = () => TResult | undefined

export type InitialStaleFunction = () => boolean

export type QueryKeySerializerFunction = (
  queryKey: QueryKey
) => [string, QueryKey[]]

export interface BaseQueryConfig<TResult, TError = unknown> {
  /**
   * Set this to `false` to disable automatic refetching when the query mounts or changes query keys.
   * To refetch the query, use the `refetch` method returned from the `useQuery` instance.
   */
  enabled?: boolean | unknown
  /**
   * If `false`, failed queries will not retry by default.
   * If `true`, failed queries will retry infinitely., failureCount: num
   * If set to an integer number, e.g. 3, failed queries will retry until the failed query count meets that number.
   * If set to a function `(failureCount, error) => boolean` failed queries will retry until the function returns false.
   */
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean)
  retryDelay?: number | ((retryAttempt: number) => number)
  staleTime?: number
  cacheTime?: number
  isDataEqual?: (oldData: unknown, newData: unknown) => boolean
  queryFn?: QueryFunction<TResult>
  queryKey?: QueryKey
  queryKeySerializerFn?: QueryKeySerializerFunction
  queryFnParamsFilter?: (args: ArrayQueryKey) => ArrayQueryKey
  initialData?: TResult | InitialDataFunction<TResult>
  initialStale?: boolean | InitialStaleFunction
  infinite?: true
}

export interface QueryObserverConfig<TResult, TError = unknown>
  extends BaseQueryConfig<TResult, TError> {
  /**
   * Set this to `false` to disable automatic refetching when the query mounts or changes query keys.
   * To refetch the query, use the `refetch` method returned from the `useQuery` instance.
   * Defaults to `true`.
   */
  enabled?: boolean | unknown
  /**
   * If set to a number, the query will continuously refetch at this frequency in milliseconds.
   * Defaults to `false`.
   */
  refetchInterval?: number
  /**
   * If set to `true`, the query will continue to refetch while their tab/window is in the background.
   * Defaults to `false`.
   */
  refetchIntervalInBackground?: boolean
  /**
   * Set this to `true` or `false` to enable/disable automatic refetching on window focus for this query.
   * Defaults to `true`.
   */
  refetchOnWindowFocus?: boolean
  /**
   * If set to `false`, will disable additional instances of a query to trigger background refetches.
   * Defaults to `true`.
   */
  refetchOnMount?: boolean
  /**
   * This callback will fire any time the query successfully fetches new data.
   */
  onSuccess?: (data: TResult) => void
  /**
   * This callback will fire if the query encounters an error and will be passed the error.
   */
  onError?: (err: TError) => void
  /**
   * This callback will fire any time the query is either successfully fetched or errors and be passed either the data or error.
   */
  onSettled?: (data: TResult | undefined, error: TError | null) => void
  /**
   * Whether errors should be thrown instead of setting the `error` property.
   * Defaults to `false`.
   */
  useErrorBoundary?: boolean
  /**
   * If set to `true`, the query will suspend when `status === 'loading'`
   * and throw errors when `status === 'error'`.
   * Defaults to `false`.
   */
  suspense?: boolean
  /**
   * Set this to `true` to keep the previous `data` when fetching based on a new query key.
   * Defaults to `false`.
   */
  keepPreviousData?: boolean
  /**
   * By default the query cache from the context is used, but a different cache can be specified.
   */
  queryCache?: QueryCache
}

export interface QueryConfig<TResult, TError = unknown>
  extends QueryObserverConfig<TResult, TError> {}

export interface PaginatedQueryConfig<TResult, TError = unknown>
  extends QueryObserverConfig<TResult, TError> {}

export interface InfiniteQueryConfig<TResult, TError = unknown>
  extends QueryObserverConfig<TResult[], TError> {
  getFetchMore: (lastPage: TResult, allPages: TResult[]) => unknown
}

export type IsFetchingMoreValue = 'previous' | 'next' | false

export enum QueryStatus {
  Idle = 'idle',
  Loading = 'loading',
  Error = 'error',
  Success = 'success',
}

export interface QueryResultBase<TResult, TError = unknown> {
  canFetchMore: boolean | undefined
  clear: () => void
  data: TResult | undefined
  error: TError | null
  failureCount: number
  fetchMore: (
    fetchMoreVariable?: unknown,
    options?: FetchMoreOptions
  ) => Promise<TResult | undefined>
  isError: boolean
  isFetched: boolean
  isFetching: boolean
  isFetchingMore?: IsFetchingMoreValue
  isIdle: boolean
  isLoading: boolean
  isStale: boolean
  isSuccess: boolean
  query: Query<TResult, TError>
  refetch: () => Promise<void>
  status: QueryStatus
  updatedAt: number
}

export interface QueryResult<TResult, TError = unknown>
  extends QueryResultBase<TResult, TError> {}

export interface PaginatedQueryResult<TResult, TError = unknown>
  extends QueryResultBase<TResult, TError> {
  resolvedData: TResult | undefined
  latestData: TResult | undefined
}

export interface InfiniteQueryResult<TResult, TError = unknown>
  extends QueryResultBase<TResult[], TError> {}

export interface MutateConfig<
  TResult,
  TError = unknown,
  TVariables = unknown,
  TSnapshot = unknown
> {
  onSuccess?: (data: TResult, variables: TVariables) => Promise<void> | void
  onError?: (
    error: TError,
    variables: TVariables,
    snapshotValue: TSnapshot
  ) => Promise<void> | void
  onSettled?: (
    data: undefined | TResult,
    error: TError | null,
    variables: TVariables,
    snapshotValue?: TSnapshot
  ) => Promise<void> | void
  throwOnError?: boolean
}

export interface MutationConfig<
  TResult,
  TError = unknown,
  TVariables = unknown,
  TSnapshot = unknown
> extends MutateConfig<TResult, TError, TVariables, TSnapshot> {
  onMutate?: (variables: TVariables) => Promise<TSnapshot> | TSnapshot
  useErrorBoundary?: boolean
  suspense?: boolean
  /**
   * By default the query cache from the context is used, but a different cache can be specified.
   */
  queryCache?: QueryCache
}

export type MutationFunction<TResult, TVariables = unknown> = (
  variables: TVariables
) => Promise<TResult>

export type MutateFunction<
  TResult,
  TError = unknown,
  TVariables = unknown,
  TSnapshot = unknown
> = (
  variables?: TVariables,
  config?: MutateConfig<TResult, TError, TVariables, TSnapshot>
) => Promise<TResult | undefined>

export type MutationResultPair<TResult, TError, TVariables, TSnapshot> = [
  MutateFunction<TResult, TError, TVariables, TSnapshot>,
  MutationResult<TResult, TError>
]

export interface MutationResult<TResult, TError = unknown> {
  status: QueryStatus
  data: TResult | undefined
  error: TError | null
  isIdle: boolean
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  reset: () => void
}

export interface ReactQueryConfig<TResult = unknown, TError = unknown> {
  queries?: ReactQueryQueriesConfig<TResult, TError>
  shared?: ReactQuerySharedConfig
  mutations?: ReactQueryMutationsConfig<TResult, TError>
}

export interface ReactQuerySharedConfig {
  suspense?: boolean
}

export interface ReactQueryQueriesConfig<TResult, TError>
  extends QueryObserverConfig<TResult, TError> {}

export interface ReactQueryMutationsConfig<
  TResult,
  TError = unknown,
  TVariables = unknown,
  TSnapshot = unknown
> extends MutationConfig<TResult, TError, TVariables, TSnapshot> {}
