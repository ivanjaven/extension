'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Cake, Briefcase, Flag, Users, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchProfileLogs } from '@/server/queries/fetch-profile-logs'
import { ActivityLogsTypedef } from '@/lib/typedef/activity-logs-typedef'
import { fetchProfile } from '@/server/queries/fetch-profile'
import { ProfileTypedef } from '@/lib/typedef/profile-typedef'
import { format, parseISO } from 'date-fns'

interface ProfilePageProps {
  params: {
    id: string
  }
}

const ITEMS_PER_PAGE = 25
const FETCH_DELAY = 2000

const ActivitySkeleton = () => (
  <div className="flex items-center space-x-4 border-b border-gray-100 py-4 last:border-b-0">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
)

const ProfileInfoItem = ({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType
  title: string
  value: string
}) => (
  <li className="flex items-center space-x-3 border-b border-gray-100 py-2 last:border-b-0">
    <Icon className="h-5 w-5 text-gray-400" />
    <span className="font-medium text-gray-700">{title}:</span>
    <span className="text-gray-600">{value}</span>
  </li>
)

const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, 'MMMM d, yyyy')
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

export default function ProfilePage({
  params,
}: ProfilePageProps): React.ReactElement {
  const [activityLog, setActivityLog] = useState<ActivityLogsTypedef[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [profile, setProfile] = useState<ProfileTypedef | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastActivityElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore],
  )

  useEffect(() => {
    const loadActivityLogs = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY))
        const response = await fetchProfileLogs(
          parseInt(params.id),
          page,
          ITEMS_PER_PAGE,
        )
        setActivityLog((prevLogs) => [...prevLogs, ...response.data])
        setHasMore(response.data.length === ITEMS_PER_PAGE)
      } catch (error) {
        console.error('Failed to fetch activity logs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!error) {
      loadActivityLogs()
    }
  }, [page, params.id, error])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile(parseInt(params.id))
        if (profileData.length > 0) {
          setProfile(profileData[0])
        } else {
          setError(true)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [params.id])

  const renderActivityItem = useCallback(
    (activity: ActivityLogsTypedef, index: number) => (
      <div
        key={activity.date + index}
        ref={index === activityLog.length - 1 ? lastActivityElementRef : null}
        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 md:p-6 lg:p-8"
      >
        <div className="mb-2 sm:mb-0">
          <p className="text-sm font-medium text-gray-900">{activity.date}</p>
          <p className="mt-1 max-w-xl text-sm text-gray-700">
            {activity.description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">{activity.label}</p>
        </div>
      </div>
    ),
    [activityLog.length, lastActivityElementRef],
  )

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              Resident Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              The requested resident profile does not exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="relative h-64 bg-gradient-to-r from-blue-500 to-indigo-600 sm:h-80">
            <Image
              src="/assets/images/cover.jpg"
              alt="Cover Photo"
              fill
              style={{ objectFit: 'cover', opacity: 0.7 }}
            />
          </div>
          <div className="relative z-10 -mt-24 flex flex-col items-center px-6 py-4 sm:-mt-28 sm:flex-row sm:items-end sm:px-8 sm:py-6">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
              {profile?.image_base64 ? (
                <Image
                  src={profile.image_base64}
                  alt="Profile Picture"
                  width={156}
                  height={156}
                  className="rounded-full border-4 border-white shadow-xl"
                />
              ) : (
                <Image
                  src="/placeholder.svg"
                  alt="Profile Picture"
                  width={156}
                  height={156}
                  className="rounded-full border-4 border-white shadow-xl"
                />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                {profile?.full_name || 'Loading...'}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {profile ? (
                  <ul className="space-y-1">
                    <ProfileInfoItem
                      icon={Users}
                      title="Gender"
                      value={profile.gender}
                    />
                    <ProfileInfoItem
                      icon={Cake}
                      title="Birthday"
                      value={formatDate(profile.date_of_birth)}
                    />
                    <ProfileInfoItem
                      icon={Heart}
                      title="Civil Status"
                      value={profile.civil_status}
                    />
                    <ProfileInfoItem
                      icon={Briefcase}
                      title="Occupation"
                      value={profile.occupation}
                    />
                    <ProfileInfoItem
                      icon={Flag}
                      title="Nationality"
                      value={profile.nationality}
                    />
                    <ProfileInfoItem
                      icon={Users}
                      title="Religion"
                      value={profile.religion}
                    />
                    <ProfileInfoItem
                      icon={Heart}
                      title="Benefits"
                      value={profile.benefits}
                    />
                  </ul>
                ) : (
                  <div className="space-y-4">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <Skeleton key={index} className="h-6 w-full" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activityLog.map(renderActivityItem)}
                {isLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <ActivitySkeleton key={index} />
                  ))}
                {!isLoading && !hasMore && activityLog.length > 0 && (
                  <p className="text-center text-gray-500">
                    No more activities to load.
                  </p>
                )}
                {!isLoading && !hasMore && activityLog.length === 0 && (
                  <p className="text-center text-gray-500">
                    No activities found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
